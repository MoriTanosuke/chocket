var socket = io.connect('/');
var unread = 0;
var username = 'John Doe';

// -------------------------------------------------------------------------
// socket.io connections
// -------------------------------------------------------------------------
socket.on('ready', function (data) {
  $('#chat').append('<p>You are logged in.</p>');
  $('#chat').append('<p>Users: ' + data['users'] + '</p>');
  scrollDown('chat');
  // hide username + connect, show disconnect
  $('#username').css('display', 'none');
  $('#connect').css('display', 'none');
  // show message input
  $('#msg').css('display', 'block');
  $('#msg').focus();
  if(isNotifyEnabled()) {
    $('#reqNotifyPerm').css('display', 'none');
  }
});

socket.on('faillogin', function(data) {
  $('#chat').append('<p class="error">' + data['reason'] + '</p>');
  scrollDown('chat');
  $('#username').css({'display':'block', 'float':'left'});
  $('#connect').css('display', 'block');
  $('#connect').removeAttr('disabled');
  $('#msg').css('display', 'none');
  if(isNotifyEnabled()) {
    $('#reqNotifyPerm').css('display', 'block');
  }
});

socket.on('disconnect', function() {
  $('#chat').append('<p>You are disconnected.</p>');
  scrollDown('chat');
  $('#username').css('display', 'block');
  $('#connect').css('display', 'block');
  $('#connect').removeAttr('disabled');
  $('#msg').css('display', 'none');
  document.title = 'disconnected ' + document.title;
  if(isNotifyEnabled()) {
    $('#reqNotifyPerm').css('display', 'block');
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
  var testMsg = $.trim(data['msg'].toLowerCase());
  var pattern = new RegExp("(^|\\s)"+testUsername+"(\\s|$)");
  if(testMsg.match(pattern)){
      mention = "mention";
      notify(data['source'] + ' said:', data['msg']);
  }
  $('#chat').append('<p><span class="timestamp">' + timestamp(new Date(data['timestamp'])) + '</span> <span class="username' + (data['source'] === "You" ? " you" : "") + '">' + data['source'] + '</span>: <span class="messagetext '+mention+'">'  + data['msg'] + '</span></p>');
  scrollDown('chat');
});

socket.on('notice', function(data) {
  $('#chat').append('<p><span class="timestamp">' + timestamp(new Date(data['timestamp'])) + '</span> <span class="notice">' + data['msg'] + '</span></p>');
  scrollDown('chat');
});

socket.on('error', function(data) {
  $('#chat').append('<p><span class="timestamp">' + timestamp(new Date(data['timestamp'])) + '</span> <span class="error">' + data['msg'] + '</span></p>');
  scrollDown('chat');
});

// -------------------------------------------------------------------------
// functions
// -------------------------------------------------------------------------
function login() {
  username = $('#username').val();
  $('#connect').attr('disabled', 'disabled');
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
  var totalHeight = $(window).innerHeight();
  var msgHeight = $("#controls").innerHeight();
  $("#chat").height(totalHeight - (msgHeight + 25));
  scrollDown('chat');
};

function scrollDown(id) {
  var objDiv = document.getElementById(id);
  objDiv.scrollTop = objDiv.scrollHeight;
}

function isNotifyAvailable() {
  // checks if notification are enabled
  //TODO notifications are only for firefox right now
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
      $('#reqNotifyPerm').css('display', 'none');
      notify('Notification allowed.', 'Thanks');
    } else {
      console.log('Notifications denied.');
    }
  });
}

function notify(title, msg) {
  if (isNotifyAvailable()) {
    if (isNotifyEnabled()) {
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

// -------------------------------------------------------------------------
// jquery
// -------------------------------------------------------------------------
// bind jquery event handlers
$(document).ready(function() {
  $('#msg').keyup(function(event) {
      if(event.keyCode == 13 && event.target.value != '') {
	socket.emit('msg', {msg: event.target.value});
	event.target.value = '';
      }
  });

  $("#username").keyup(function(event){
      if(event.keyCode == 13 && event.target.value != '') {
	      login();
      }
  });

  $("#connect").click(function(event){
      login();
  });

  $('#chat').bind('mousewheel', function(e) {
      var scrollTop = $(this).scrollTop() - e.originalEvent.wheelDelta;
      $(this).scrollTop(scrollTop);
  });

  $(window).bind("resize",resizeWindow);
  setTimeout(resizeWindow,100);

  // webkit
  $('#chat').bind('mousewheel', function(e) {
    var scrollTop = $(this).scrollTop() - e.originalEvent.wheelDelta;
    $(this).scrollTop(scrollTop);
  });

  $('#chat').bind('DOMMouseScroll', function(e) {
    var scrollTop = $(this).scrollTop() - e.originalEvent.detail;
    $(this).scrollTop(scrollTop);
  });
});
