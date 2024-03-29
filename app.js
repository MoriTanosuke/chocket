var app = require('http').createServer(handler)
, io = require('socket.io')(app)
, fs = require('fs')
, path = require('path')
, utils = require('./utils.js');

// we're using herokus PORT or 8888 locally
var port = process.env.PORT || 8888;
app.listen(port);
console.log("Application running on port " + port);

// create FIFO for last sent messages

function handler(req, res) {
  let filePath = '.' + req.url;
  if (filePath === './') {
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
      if(error.code === 'ENOENT'){
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

var queue = {};
var users = [];

const MESSAGE = 'msg';
const NOTICE = 'notice';
const FAILLOGIN = 'faillogin';
const READY = 'ready';
const ERROR = 'msgerr';

function emit(socket, cmd, data) {
  socket.emit(cmd, data);
}

function emitRoom(socket, room, cmd, data) {
  socket.broadcast.to(room).emit(cmd, data);
}

function resendQueue(room, socket) {
  if (queue[room] && queue[room].length > 0) {
    emit(socket, NOTICE, {
      timestamp: new Date(),
      msg: 'Sending you the last ' + queue[room].length + ' recent messages...'
    });
    for (let i in queue[room]) {
      emit(socket, MESSAGE, queue[room][i]);
    }
  }
}

function handleCommand(line, socket, time, room) {
  // special commands
  if (line === '/users') {
    emit(socket, NOTICE, {
      timestamp: time,
      msg: 'Users: ' + utils.escapeHTML(users.join(','))
    });
  } else if (line === '/rooms') {
    const roomlist = [room];
    for (let r in Object.entries(io.sockets.adapter.rooms)) {
      if (r) {
        roomlist.push(r);
      }
    }
    emit(socket, NOTICE, {
      timestamp: time,
      msg: 'Rooms: ' + utils.escapeHTML(roomlist.join(','))
    });
  } else if (line.indexOf('/join') === 0) {
    // leave current channel
    socket.leave(room);
    emitRoom(socket, room, NOTICE, {
      timestamp: time,
      msg: 'User ' + socket.username + ' left this channel.'
    });
    // join other channel
    room = line.match(/\w+$/);
    socket.join(room);
    emit(socket, NOTICE, {
      timestamp: time,
      msg: 'You switched to room ' + room
    });
    emitRoom(socket, room, NOTICE, {
      timestamp: time,
      msg: 'User ' + socket.username + ' joined this channel',
      username: ''
    });
    resendQueue(room, socket);
  } else if (line.indexOf('/help') === 0) {
    emit(socket, NOTICE, {
      timestamp: time,
      msg: 'Available commands:<ul>' +
        '<li>/users - show list of users</li>' +
        '<li>/rooms - show list of rooms</li>' +
        '<li>/join &lt;room&gt; - switch to another chat room</li>' +
        '<li>/help - show this help</li>' +
        '</ul>'
    });
  } else {
    emit(socket, ERROR, {
      timestamp: time,
      msg: 'Unknown command. Type /help to see a list of available commands.'
    });
  }
}

io.sockets.on('connection', function (socket) {
  var room = 'Lobby';
  socket.on('login', function (data) {
    if (data['username'] === '') {
      emit(socket, FAILLOGIN, {timestamp: new Date(), users: users, reason: 'No username given'});
    } else if (users.includes(data['username'])) {
      emit(socket, FAILLOGIN, {timestamp: new Date(), users: users, reason: 'Username already taken'});
    } else {
      var time = new Date();
      socket.join(room);

      // store username
      socket.username = data['username'];
      emitRoom(socket, room, NOTICE, {
        timestamp: time,
        msg: 'User ' + utils.escapeHTML(data['username']) + ' joined'
      });
      users.push(data['username']);

      emit(socket, READY, {
        timestamp: time,
        username: utils.escapeHTML(data['username']),
        users: utils.escapeHTML(users.join(','))
      });
      resendQueue(room, socket);
    }
  });

  socket.on('disconnect', function () {
    for (let i in users) {
      if (users[i] === socket.username) {
        users.splice(i, 1);
      }
    }
    const time = new Date();
    emitRoom(socket, room, MESSAGE, {
      timestamp: time,
      source: utils.escapeHTML(socket.username),
      msg: 'User left'
    });
  });

  socket.on(MESSAGE, function (data) {
    const time = new Date();

    if (data['msg'][0] === '/') {
      handleCommand(data['msg'], socket, time, room)
    } else {
      var msg = {
        source: utils.escapeHTML(socket.username),
        msg: utils.escapeHTML(data['msg']),
        timestamp: time
      };
      emitRoom(socket, room, MESSAGE, msg);
      // add message to FIFO
      if (!queue[room]) {
        queue[room] = [];
      }
      queue[room].push(msg);
      if (queue[room].length > 10) queue[room].shift();
      emit(socket, MESSAGE, {
        source: 'You',
        msg: utils.escapeHTML(data['msg']),
        timestamp: time
      });
    }
  });
});
