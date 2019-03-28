var vows = require('vows')
  , assert = require('assert')
  , emotes = require('../emoticons.js')
;

var suite = vows.describe('emoticons').addBatch({
  'A happy face': {
    'in a string': {
      topic: "this is a :-) face",
      'is replaced with 😃': function(topic) {
        assert.equal(emotes.replace(topic), 'this is a 😃 face');
      },
    }
  },
  'A sad face': {
    'in a string': {
      topic: "this is a :-( face",
      'is replaced with 🙁': function(topic) {
        assert.equal(emotes.replace(topic), 'this is a 🙁 face');
      },
    }
  },
}).export(module);
