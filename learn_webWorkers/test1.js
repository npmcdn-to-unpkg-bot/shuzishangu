var app = angular.module('myApp',[]);
app.factory('helloWorldService',[$q,function($q){
    var worker = new Worker('doWork.js');
    var defer = $q.defer();
    worker.addEventListener('message',function(e){
        console.log('worker said:' ,e.data);
        defer.resolve(e.data);
    },false);

    return {
        doWork:function(myData){
            defer = $q.defer();
            worker.postMessage(myData);
            return defer.promise;
        }
    };
}]);