var vows = require('vows')
  , assert = require('assert')
  , utils = require('../utils.js')
;

var suite = vows.describe('utils').addBatch({
  'URLs': {
    topic: 'this is a test url https://www.google.de/ that should be replaced with HTML links',
    'are replaced with links': function(topic) {
      const replaced = utils.escapeHTML(topic);
      assert.equal(replaced.indexOf('a href='), 20);
    },
  }
}).export(module);
