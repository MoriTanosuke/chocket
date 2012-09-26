var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , emotes = require('./emoticons.js');

// we're using herokus PORT or 8888 locally
var port = process.env.PORT || 8888;
app.listen(port);
console.log("Application running on port " + port);

// create FIFO for last sent messages

function handler (req, res) {
  // check if we should serve an image
  var filePath = '.' + req.url;
  if(filePath.indexOf('./img/') == 0) {
    fs.readFile(filePath, function(err, data) {
      if(err) {
        console.log("Something went wrong while serving an image from " + filePath);
        res.writeHead(200); // we're silently supressing output
        return res.end();
      }
      res.writeHead(200);
      return res.end(data);
    });
  } else {
    fs.readFile(__dirname + '/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
  
      res.writeHead(200);
      res.end(data);
    });
  }
}

function escapeHTML(string) {
  return replaceURLWithHTMLLinks(string.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
}

function highlight(searchFor, string) {
  if(string.indexOf(searchFor) >= 0) {
    string = '<span class="highlight">' + string + '</span>';
  }
  return string;
}

function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

function isDuplicate(username) {
  for(i in users) {
    if(users[i] == username) {
      return true;
    }
  }
  return false;
}

var queue = new Array();
var users = new Array();
var room = 'Lobby';

var chat = io.of('/chat').on('connection', function (socket) {
  socket.on('login', function (data) {
    if(data['username'] == '') {
      console.log('No username given');
      socket.emit('faillogin', {timestamp: new Date(), users: users, reason: 'No username given'});
    } else if (isDuplicate(data['username'])) {
      console.log('Username ' + data['username'] + ' already in use');
      socket.emit('faillogin', {timestamp: new Date(), users: users, reason: 'Username already taken'});
    } else {
      var time = new Date();
      console.log('User ' + data['username'] + ' joined');
      socket.set('username', data['username'], function() {
        socket.broadcast.emit('msg', {timestamp: time, source: data['username'], msg: 'User joined'});
        users.push(data['username']);
      });
      socket.emit('ready', {timestamp: time, room: room, username: data['username'], users: users});
      if(queue && queue.length > 0) {
        socket.emit('notice', {timestamp: time, msg: 'Sending you the last ' + queue.length + ' recent messages...'});
        for(i in queue) {
          socket.emit('msg', queue[i]);
        }
      }
    }
  });
  socket.on('disconnect', function() {
    socket.get('username', function(err, username) {
      for(i in users) {
        if(users[i] == username) {
          users.splice(i, 1);
        }
      }
      var time = new Date();
      console.log('User ' + username + ' left');
      socket.broadcast.emit('msg', {timestamp: time, source: username, msg: 'User left'});
    });
  });

  socket.on('msg', function(data) {
    var time = new Date();
    if(data['msg'][0] === '/') {
      // special commands
      if(data['msg'] === '/users') {
        socket.emit('notice', {timestamp: time, msg: 'Users: ' + users.join(',')});
      } else {
        socket.emit('error', {timestamp: time, msg: 'Unknown command'});
      }
    } else {
      socket.get('username', function(err, username) {
        var msg = {source: username, msg: emotes.replace(escapeHTML(data['msg'])), timestamp: time};
        socket.broadcast.emit('msg', msg);
	// add message to FIFO
        queue.push(msg);
	if(queue.length > 10) queue.shift();
        socket.emit('msg', {source: 'You', msg: emotes.replace(escapeHTML(data['msg'])), timestamp: time});
      });
    }
  });
});



