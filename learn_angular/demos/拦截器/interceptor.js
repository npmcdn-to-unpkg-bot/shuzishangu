angular.module('myApp',[])
    .factory('myInterceptor',function($q){
        var interceptor = {
            'request' :function(config){
                // 成功的请求方法
                return config; // 或者 $q.when(config);
            } ,
            'response': function(response) {
            // 响应成功
            return response; // 或者 $q.when(config);
            },
            'requestError': function(rejection) {
            // 请求发生了错误，如果能从错误中恢复，可以返回一个新的请求或promise
            return response; // 或新的promise
            // 或者，可以通过返回一个rejection来阻止下一步
            // return $q.reject(rejection);
            },
            'responseError': function(rejection) {
            // 请求发生了错误，如果能从错误中恢复，可以返回一个新的响应或promise
            return rejection; // 或新的promise
            // 或者，可以通过返回一个rejection来阻止下一步
            // return $q.reject(rejection);
            }
            };
            return interceptor;
    })
    .config(function($httpProvider){
        $httpProvider.interceptors.push('myInterceptor');
    });

//注册

