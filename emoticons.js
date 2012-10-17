var emoticons = {
  smile: '<img src="/img/smile.png" alt=":-)" />',
  sad: '<img src="/img/sad.png" alt=":-(" />',
  wink: '<img src="/img/wink.png" alt=";-)" />',
  plain: '<img src="/img/wtf.png" alt=":-|" />',
  grin: '<img src="/img/grin.png" alt=":-D" />',
  surprise: '<img src="/img/surprised.png" alt=":-O" />',
  tongue: '<img src="/img/tongue.png" alt=":-P" />',
  dazed: '<img src="/img/dazed.png" alt="%-)" />',
};

var patterns = {
  smile: /:-?\)/gm,
  sad: /:-?\(/gm,
  wink: /;-?\)/gm,
  plain: /:-?\|/gm,
  grin: /:-?D/gm,
  surprise: /:-?O/gm,
  tongue: /:-?P/gm,
  dazed: /%-?\)/gm,
};

exports.replace = function(string) {
  //TODO add more replaces with other patterns
  return string.replace(patterns.smile, emoticons.smile)
    .replace(patterns.sad, emoticons.sad)
    .replace(patterns.wink, emoticons.wink)
    .replace(patterns.plain, emoticons.plain)
    .replace(patterns.grin, emoticons.grin)
    .replace(patterns.surprise, emoticons.surprise)
    .replace(patterns.tongue, emoticons.tongue)
    .replace(patterns.dazed, emoticons.dazed);
};
