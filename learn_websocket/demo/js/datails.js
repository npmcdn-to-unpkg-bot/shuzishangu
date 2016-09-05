/**
 * Created by liushan on 2016/8/24.
 */
angular.module('myApp',[])
.controller('customerList',['myService',function(myService){
    $scope.customers = myService.getCustomers();
}]);





