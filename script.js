var socket = io.connect('/');
var unread = 0;
var username = 'John Doe';

function append(id, text) {
  document.getElementById(id).innerHTML += text;
}

// -------------------------------------------------------------------------
// socket.io connections
// -------------------------------------------------------------------------
socket.on('ready', function (data) {
  append('chat', '<p>You are logged in.</p>');
  append('chat', '<p>Users: ' + data['users'] + '</p>');
  scrollDown('chat');
  // hide username + connect, show disconnect
  document.getElementById('username').style.display = 'none';
  document.getElementById('connect').style.display = 'none';
  // show message input
  document.getElementById('msg').style.display = 'block';
  document.getElementById('msg').focus();
  if(isNotifyEnabled()) {
    document.getElementById('reqNotifyPerm').style.display = 'none';
  }
});

socket.on('faillogin', function(data) {
  append('chat', '<p class="error">' + data['reason'] + '</p>');
  scrollDown('chat');
  document.getElementById('username').style.display ='block';
  document.getElementById('username').style.float = 'left';
  document.getElementById('connect').style.display = 'block';
  document.getElementById('connect').removeAttribute('disabled');
  document.getElementById('msg').style.display = 'none';
  if(isNotifyEnabled()) {
    document.getElementById('reqNotifyPerm').style.display = 'block';
  }
});

socket.on('disconnect', function() {
  append('chat', '<p>You are disconnected.</p>');
  scrollDown('chat');
  document.getElementById('username').style.display = 'block';
  document.getElementById('connect').style.display = 'block';
  document.getElementById('connect').removeAttribute('disabled');
  document.getElementById('msg').style.display = 'none';
  document.title = 'disconnected ' + document.title;
  if(isNotifyEnabled()) {
    document.getElementById('reqNotifyPerm').style.display = 'block';
  }
});

socket.on('msg', function(data) {
  if(document.hasFocus()) {
    unread = 0;
  } else {
    unread++;
  }
  document.title = '(' + unread + ') chat';

  var mention = "";
  var testUsername = username.toLowerCase();
  var testMsg = data['msg'].toLowerCase().trim();
  var pattern = new RegExp("(^|\\s)"+testUsername+"(\\s|$)");
  if(testMsg.match(pattern)){
    mention = "mention";
    notify(data['source'] + ' said:', data['msg']);
  }
  append('chat', '<p><span class="timestamp">' + timestamp(new Date(data['timestamp'])) + '</span> <span class="username' + (data['source'] === "You" ? " you" : "") + '">' + data['source'] + '</span>: <span class="messagetext '+mention+'">'  + data['msg'] + '</span></p>');
  scrollDown('chat');
});

socket.on('notice', function(data) {
  append('chat', '<p><span class="timestamp">' + timestamp(new Date(data['timestamp'])) + '</span> <span class="notice">' + data['msg'] + '</span></p>');
  scrollDown('chat');
});

socket.on('msgerr', function(data) {
  append('chat', '<p><span class="timestamp">' + timestamp(new Date(data['timestamp'])) + '</span> <span class="error">' + data['msg'] + '</span></p>');
  scrollDown('chat');
});

// -------------------------------------------------------------------------
// functions
// -------------------------------------------------------------------------
function login() {
  username = document.getElementById('username').value;
  document.getElementById('connect').attributes['disabled'] = 'disabled';
  socket.emit('login', {username: username});
}

function timestamp(t) {
  var hours = t.getHours();
  var minutes = t.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = "0" + minutes;
  }
  return hours + ":" + minutes;
}

function resizeWindow(){
  var totalHeight = window.innerHeight;
  var msgHeight = document.getElementById('controls').clientHeight;
  document.getElementById('chat').style.height = totalHeight - (msgHeight + 25) + 'px';
  scrollDown('chat');
};

function scrollDown(id) {
  var objDiv = document.getElementById(id);
  objDiv.scrollTop = objDiv.scrollHeight;
}

function isNotifyAvailable() {
  // checks if notification are enabled
  return "Notification" in window;
}

function isNotifyEnabled() {
  // 0 is PERMISSION_ALLOWED
  return Notification.permission === "granted";
}

function enableNotify() {
  Notification.requestPermission().then(function(status) {
    if(status === "granted") {
      // hide button
      document.getElementById('reqNotifyPerm').style.display = 'none';
      notify('Notification allowed.', 'Thanks');
    } else {
      console.log('Notifications denied.');
    }
  });
}

function notify(title, msg) {
  if (isNotifyAvailable()) {
    if (isNotifyEnabled()) {
      //TODO replace HTML in notification body?
      const n = new Notification(title, {body: msg, icon: '/img/favicon.png'});
      setTimeout(() => {
        n.close();
      }, 3000);
    } else {
      enableNotify();
    }
  } else {
    console.log("Notifications are not supported for this Browser/OS version yet.");
  }
}

window.onload = function() {
  if(isNotifyEnabled()) {
    document.getElementById('reqNotifyPerm').style.display = 'none';
  }
  document.getElementById('msg').onkeyup = function(event) {
    if(event.keyCode == 13 && event.target.value != '') {
     socket.emit('msg', {msg: event.target.value});
     event.target.value = '';
   }
  };

  document.getElementById('username').onkeyup = function(event){
    if(event.keyCode == 13 && event.target.value != '') {
      login();
    }
  };

  document.getElementById("connect").onclick = function(event){
    login();
  };

  window.onresize = resizeWindow;
  setTimeout(resizeWindow,100);
};
