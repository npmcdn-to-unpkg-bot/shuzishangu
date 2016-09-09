var connections = 0;
self.addEventListener('connect',function(e){
    var port = e.ports[0];
    connections++;

    post.addEventListener('message',function(e){
        port.postMessage('hello '+e.data+"(port #"+connections+")");
    },false);

    port.start();
},false);