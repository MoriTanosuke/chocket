var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')
  , emotes = require('./emoticons.js');

// we're using herokus PORT or 8888 locally
var port = process.env.PORT || 8888;
app.listen(port);
console.log("Application running on port " + port);

// create FIFO for last sent messages

function handler(req, res) {
  var filePath = '.' + req.url;
  if (filePath == './') {
    filePath = './index.html';
  }

  // get file extension
  var extname = path.extname(filePath);
  var contentType = 'text/html;charset=utf-8';
  switch (extname) {
      case '.js':
          contentType = 'text/javascript';
          break;
      case '.css':
          contentType = 'text/css';
          break;
      case '.json':
          contentType = 'application/json';
          break;
      case '.png':
          contentType = 'image/png';
          break;
      case '.jpg':
          contentType = 'image/jpg';
          break;
  }

  fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    res.writeHead(404, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                });
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                res.end();
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

}

function escapeHTML(string) {
  string = string || "";
  return replaceURLWithHTMLLinks(string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
}

function replaceURLWithHTMLLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
}

function isDuplicate(username) {
  for (i in users) {
    if (users[i] === username) {
      return true;
    }
  }
  return false;
}

var queue = {};
var users = [];

function resendQueue(room, socket) {
  if (queue[room] && queue[room].length > 0) {
    socket.emit('notice', {
      timestamp: new Date(),
      msg: 'Sending you the last ' + queue[room].length + ' recent messages...'
    });
    for (i in queue[room]) {
      socket.emit('msg', queue[room][i]);
    }
  }
}

io.sockets.on('connection', function (socket) {
  var room = 'Lobby';
  socket.on('login', function (data) {
    if (data['username'] === '') {
      console.log('No username given');
      socket.emit('faillogin', {timestamp: new Date(), users: users, reason: 'No username given'});
    } else if (isDuplicate(data['username'])) {
      console.log('Username ' + data['username'] + ' already in use');
      socket.emit('faillogin', {timestamp: new Date(), users: users, reason: 'Username already taken'});
    } else {
      var time = new Date();
      console.log('User ' + data['username'] + ' joined');
      socket.join(room);

      // store username
      socket.username = data['username'];
      socket.broadcast.to(room).emit('notice', {
          timestamp: time,
          msg: 'User ' + escapeHTML(data['username']) + ' joined'
        });
      users.push(data['username']);

      socket.emit('ready', {
        timestamp: time,
        username: escapeHTML(data['username']),
        users: escapeHTML(users.join(','))
      });
      resendQueue(room, socket);
    }
  });
  socket.on('disconnect', function () {
    for (i in users) {
      if (users[i] === socket.username) {
        users.splice(i, 1);
      }
    }
    var time = new Date();
    console.log('User ' + socket.username + ' left');
    socket.broadcast.to(room).emit('msg', {timestamp: time, source: escapeHTML(socket.username), msg: 'User left'});
  });

  socket.on('msg', function (data) {
    var time = new Date();
    if (data['msg'][0] === '/') {
      // special commands
      if (data['msg'] === '/users') {
        socket.emit('notice', {timestamp: time, msg: 'Users: ' + escapeHTML(users.join(','))});
      } else if (data['msg'] === '/rooms') {
        var roomlist = [];
        for (var r in io.rooms) {
          if (r) {
            roomlist.push(r.substr(1));
          }
        }
        socket.emit('notice', {timestamp: time, msg: 'Rooms: ' + escapeHTML(roomlist.join(','))});
      } else if (data['msg'].indexOf('/join') === 0) {
        console.log('join ' + room);
        // leave current channel
        socket.leave(room);
        socket.broadcast.to(room).emit('notice', {timestamp: time, msg: 'User ' + socket.username + ' left this channel.'});
        // join other channel
        room = data['msg'].match(/\w+$/);
        socket.join(room);
        socket.emit('notice', {timestamp: time, msg: 'You switched to room ' + room});
        socket.broadcast.to(room).emit('notice', {
          timestamp: time,
          msg: 'User ' + socket.username + ' joined this channel',
          username: ''
        });
        resendQueue(room, socket);
      } else if (data['msg'].indexOf('/help') === 0) {
        socket.emit('notice', {
          timestamp: time, msg: 'Available commands:<ul>' +
            '<li>/users - show list of users</li>' +
            '<li>/rooms - show list of rooms</li>' +
            '<li>/join &lt;room&gt; - switch to another chat room</li>' +
            '<li>/help - show this help</li>' +
            '</ul>'
        });
      } else {
        socket.emit('error', {
          timestamp: time,
          msg: 'Unknown command. Type /help to see a list of available commands.'
        });
      }
    } else {
      var msg = {source: escapeHTML(socket.username), msg: emotes.replace(escapeHTML(data['msg'])), timestamp: time};
      socket.broadcast.to(room).emit('msg', msg);
      // add message to FIFO
      if (!queue[room]) {
        queue[room] = [];
      }
      queue[room].push(msg);
      if (queue[room].length > 10) queue[room].shift();
      socket.emit('msg', {source: 'You', msg: emotes.replace(escapeHTML(data['msg'])), timestamp: time});
    }
  });
});
