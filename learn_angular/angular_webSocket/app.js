/**
 * Created by liushan on 2016/8/24.
 */
'use strict';

angular.module('myApp',['ngWebsocket']);

myApp.controller('myCtrl',function($websocket){
    var ws = $websocket.$new('ws://localhost:8000');

    ws.$on('$open',function(){
        ws.$emit('hello', 'world');// it sends the event 'hello' with data 'world'
    })
        .$on('incoming event', function (message) { // it listents for 'incoming event'
            console.log('something incoming from the server: ' + message);
        });


})
