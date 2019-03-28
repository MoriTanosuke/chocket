var emoji = {
  smile: {
    html: '😃',
    pattern: /:-?\)/gm,
  },
  sad: {
    html: '🙁',
    pattern: /:-?\(/gm,
  },
  wink: {
    html: '😉',
    pattern: /;-?\)/gm,
  },
  plain: {
    html: '😐',
    pattern: /:-?\|/gm,
  },
  grin: {
    html: '😀',
    pattern: /:-?D/gm,
  },
  surprise: {
    html: '😯',
    pattern: /:-?O/gm,
  },
  tongue: {
    html: '😛',
    pattern: /:-?P/gm,
  },
  dazed: {
    html: '😲',
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
