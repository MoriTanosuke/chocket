var vows = require('vows')
  , assert = require('assert');

function FIFO(size, initial) {
  size = (size || 10);
  initial = (initial || []);
  var queue = Array.apply(null, initial);
  queue.size = size;
  //redefine
  queue.push = FIFO.push;
  queue.pop = FIFO.pop;

  FIFO.trim.call(queue);

  return(queue);
}

FIFO.trim = function() {
  if(this.length < this.size) {
    // no trimming needed
    return;
  };
  Array.prototype.slice.call(this, 0, this.size);
}
FIFO.wrapMethod = function(methodName, trimMethod) {
  var wrapper = function() {
    var method = Array.prototype[methodName];
    var result = method.apply(this, arguments);
    trimMethod.call(this);
    return(result);
  };
  return(wrapper);
}
FIFO.push = FIFO.wrapMethod("push", FIFO.trim);
FIFO.pop = FIFO.wrapMethod("shift", FIFO.trim);

var suite = vows.describe('FIFO').addBatch({
  'A FIFO': {
    'with zero elements': {
      topic: FIFO(),
      'has length of 0': function(topic) {
        assert.equal(topic.length, 0);
      },
      'returns *undefined*, when `shift`ed': function(topic) {
        assert.isUndefined(topic.shift());
      }
    },
    'with elements [1, 2, 3]': {
      topic: FIFO(undefined, [1, 2, 3]),
      'has length of 3': function(topic) {
        assert.equal(topic.length, 3);
      },
      'returns 1, when `shift`ed': function(topic) {
        assert.equal(topic.shift(), 1);
      }
    },
    'with max=5': {
      topic: FIFO(5, [1, 2, 3, 4, 5]),
      'has always max 5 elements after push': function(topic) {
        assert.equal(topic.length, 5);
        topic.push(6);
        assert.equal(topic.length, 5);
        assert.equal(topic.shift(), 2);
        assert.equal(topic.length, 4);
      }
    }
  }
}).export(module);

