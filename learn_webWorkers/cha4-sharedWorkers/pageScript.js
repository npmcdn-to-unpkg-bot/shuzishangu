var worker = new SharedWorker('jsworker.js');
//  you must communicate via a ‘port’ object and attach a message event handler. 

worker.port.addEventListener('message',function(e){
    alert(e.data);
},false);

worker.port.start();
 //post a message to the shared web worker
 worker.port.postMessage('almomlgolse');