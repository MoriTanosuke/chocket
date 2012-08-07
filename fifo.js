exports.FIFO = function(size, initial) {
  size = (size || 10);
  initial = (initial || []);
  var queue = Array.apply(null, initial);
  queue.size = size;
  //redefine
  queue.push = exports.push;
  queue.pop = exports.pop;

  exports.trim.call(queue);

  return(queue);
}

exports.trim = function() {
  if(this.length < this.size) {
    // no trimming needed
    return;
  };
  Array.prototype.slice.call(this, 0, this.size);
}
exports.wrapMethod = function(methodName, trimMethod) {
  var wrapper = function() {
    var method = Array.prototype[methodName];
    var result = method.apply(this, arguments);
    trimMethod.call(this);
    return(result);
  };
  return(wrapper);
}
exports.shift = exports.wrapMethod("shift", exports.trim);
exports.push = exports.wrapMethod("push", exports.shift);


