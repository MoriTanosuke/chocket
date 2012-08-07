var vows = require('vows')
  , assert = require('assert')
;

var suite = vows.describe('fifo').addBatch({
  'A fifo': {
    'with zero elements': {
      topic: [],
      'has length of 0': function(topic) {
        assert.equal(topic.length, 0);
      },
      'returns *undefined*, when `shift`ed': function(topic) {
        assert.isUndefined(topic.shift());
      }
    },
    'with elements [1, 2, 3]': {
      topic: [1, 2, 3],
      'has length of 3': function(topic) {
        assert.equal(topic.length, 3);
      },
      'returns 1, when `shift`ed': function(topic) {
        assert.equal(topic.shift(), 1);
      }
    },
    'with max=5': {
      topic: [1, 2, 3, 4, 5],
      'has always max 5 elements after push': function(topic) {
        assert.equal(topic.length, 5);
        topic.push(6);
	topic.shift();
        assert.equal(topic.length, 5);
        assert.equal(topic.join(','), '2,3,4,5,6');
      }
    }
  }
}).export(module);
