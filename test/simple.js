var vows = require('vows')
  , assert = require('assert')
;

var suite = vows.describe('javascript').addBatch({
  'Files ending with .js': {
      topic: "./js/script.js",
      'is recognized as a script file': function(topic) {
        assert.equal(topic.indexOf('.js'), topic.length - 3);
      },
  }
}).export(module);
