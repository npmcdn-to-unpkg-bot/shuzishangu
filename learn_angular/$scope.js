/**
 * Created by liushan on 2016/8/17.
 */
var myApp = angular.module('myapp',[]);
    //返回创建模块的实例，模块是service controller的容器
myApp.controller('myCtrl', function ($scope) {
    //构造器的控制函数
    $scope.getName = function () {
        return $scope.name;
    }
});

$scope.$on('locationChangeSuccess',function(event,newUrl,oldUrl){
    //每一个作用域实例都有一个$on方法，用于注册作用域事件的handler。
    
});

var notificationsService = function () {
    this.MAX_LEN = 15;

}