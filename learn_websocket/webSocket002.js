/**
 * Created by liushan on 2016/8/15.
 */
var exampleSocket = new WebSocket('ws://127.0.0.1:8000');

exampleSocket.onopen = function (event) {
    console.log('connected');
};
//exampleSocket.close();
exampleSocket.onerror = function(event){
    console.log(event);
};