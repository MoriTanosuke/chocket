var emoji = {
  smile: {
    html: '<img src="/img/smile.png" alt=":-)" />',
    pattern: /:-?\)/gm,
  },
  sad: {
    html: '<img src="/img/sad.png" alt=":-(" />',
    pattern: /:-?\(/gm,
  },
  wink: {
    html: '<img src="/img/wink.png" alt=";-)" />',
    pattern: /;-?\)/gm,
  },
  plain: {
    html: '<img src="/img/wtf.png" alt=":-|" />',
    pattern: /:-?\|/gm,
  },
  grin: {
    html: '<img src="/img/grin.png" alt=":-D" />',
    pattern: /:-?D/gm,
  },
  surprise: {
    html: '<img src="/img/surprised.png" alt=":-O" />',
    pattern: /:-?O/gm,
  },
  tongue: {
    html: '<img src="/img/tongue.png" alt=":-P" />',
    pattern: /:-?P/gm,
  },
  dazed: {
    html: '<img src="/img/dazed.png" alt="%-)" />',
    pattern: /%-?\)/gm,
  }
};

function replaceEmoticons(string) {
  for(var key in emoji) {
    string = string.replace(emoji[key].pattern, emoji[key].html);
  }
  return string;
};

(function(exports){
  exports.replace = replaceEmoticons;
})(typeof exports === 'undefined'? this['mymodule']={}: exports);
