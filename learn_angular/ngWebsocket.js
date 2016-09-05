/**
 * Created by liushan on 2016/8/15.
 */
angular.module('myApp')
    .factory('myService',['$q','$rootScope'],function($q,$rootScope){
        var service = {};
        var callback = {};
        var currentCallbackId = 0;
        var ws = new WebSocket('ws://localhost:8000/socket/');

        ws.onopen = function(){
            console.log('Socket has been opened!')
        };
        ws.onmessage = function(message){
            listener(JSON.parse(message.data));
        };

        function sendRequest(request){
            var defer = $q.defer();
            var callbackId = getCallbackId();
            callbacks[callbackId] = {
                time :new Date(),
                cb:defer
            }
        }
    });