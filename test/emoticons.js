var vows = require('vows')
  , assert = require('assert')
  , emotes = require('../emoticons.js')
;

var suite = vows.describe('emoticons').addBatch({
  'A happy face': {
    'in a string': {
      topic: "this is a :-) face",
      'is replaced with smile.png': function(topic) {
        assert.equal(emotes.replace(topic), 'this is a <img src="/img/smile.png" alt=":-)" /> face');
      },
    }
  },
  'A sad face': {
    'in a string': {
      topic: "this is a :-( face",
      'is replaced with sad.png': function(topic) {
        assert.equal(emotes.replace(topic), 'this is a <img src="/img/sad.png" alt=":-(" /> face');
      },
    }
  },
}).export(module);
