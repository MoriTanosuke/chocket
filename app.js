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
  string = string || "";
  return replaceURLWithHTMLLinks(string.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
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

var queue = {};
var users = new Array();

function resendQueue(room, socket) {
  if(queue[room] && queue[room].length > 0) {
    socket.emit('notice', {timestamp: new Date(), msg: 'Sending you the last ' + queue[room].length + ' recent messages...'});
    for(i in queue[room]) {
      socket.emit('msg', queue[room][i]);
    }
  }
}

io.sockets.on('connection', function(socket) {
  var room = 'Lobby';
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
      socket.join(room);
      socket.set('username', data['username'], function() {
        socket.broadcast.to(room).emit('msg', {timestamp: time, source: escapeHTML(data['username']), msg: 'User joined'});
        users.push(data['username']);
      });
      socket.emit('ready', {timestamp: time, username: escapeHTML(data['username']), users: escapeHTML(users.join(','))});
      resendQueue(room, socket);
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
      socket.broadcast.to(room).emit('msg', {timestamp: time, source: escapeHTML(username), msg: 'User left'});
    });
  });

  socket.on('msg', function(data) {
    var time = new Date();
    if(data['msg'][0] === '/') {
      // special commands
      if(data['msg'] === '/users') {
        socket.emit('notice', {timestamp: time, msg: 'Users: ' + escapeHTML(users.join(','))});
      } else if(data['msg'].indexOf('/join') == 0) {
socket.get('username', function(err, username) {
        console.log('join ' + room);
        socket.broadcast.to(room).emit('notice', {timestamp: time, msg: 'User ' + username + ' left this channel.'});
        socket.leave(room);
        room = data['msg'].match(/\w+$/);
        socket.join(room);
        socket.emit('notice', {timestamp: time, msg: 'You switched to room ' + room});
        socket.broadcast.to(room).emit('notice', {timestamp: time, msg: 'User ' + username + ' joined this channel', username: ''});
});
        resendQueue(room, socket);
      } else if(data['msg'].indexOf('/help') == 0) {
        console.log('help');
        socket.emit('notice', {timestamp: time, msg: 'Available commands:<ul><li>/users - show list of users</li><li>/join &lt;room&gt; - switch to another chat room</li><li>/help - show this help</li></ul>'});
      } else {
        socket.emit('error', {timestamp: time, msg: 'Unknown command. Type /help to see a list of available commands.'});
      }
    } else {
      socket.get('username', function(err, username) {
        var msg = {source: escapeHTML(username), msg: emotes.replace(escapeHTML(data['msg'])), timestamp: time};
        socket.broadcast.to(room).emit('msg', msg);
	// add message to FIFO
        if(!queue[room]) {queue[room] = [];}
        queue[room].push(msg);
	if(queue[room].length > 10) queue[room].shift();
        socket.emit('msg', {source: 'You', msg: emotes.replace(escapeHTML(data['msg'])), timestamp: time});
      });
    }
  });
});

