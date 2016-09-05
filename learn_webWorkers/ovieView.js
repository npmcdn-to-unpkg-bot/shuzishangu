var worker = new Worker('routes.js');
worker.onmessage = function(event) {
  console.log("Called back by the routes-worker with the best route to the pub");
};
worker.postMessage();