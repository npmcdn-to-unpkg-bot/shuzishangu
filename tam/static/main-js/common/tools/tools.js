angular.module('common')
    .controller("toolsContronller", ['$scope', '$modalInstance', '$translate','$modal', 'InterService','authentifiedRequest','toastr', function($scope, $modalInstance,$translate, $modal, InterService,authentifiedRequest,toastr) {
        $scope.skin = InterService.skin;
        $scope.InterService = InterService;
        //tools
        $scope.tools = [{
            "id": 0,
            "name": "-Select Command-"
        }, {
            "id": 1,
            "name": "show system info"
        }, {
            "id": 2,
            "name": "show WIFI info"
        },
        // {
        //     "id": 3,
        //     "name": "show traps info"
        // }, 
        {
            "id": 4,
            "name": "show history syslog info"
        }, {
            "id": 7,
            "name": "tcpdump"
        }, {
            "id": 8,
            "name": "traceroute"
        }, {
            "id": 9,
            "name": "ping"
        }, {
            "id": 10,
            "name": "show history reset reason"
        }];

        //operation
        $scope.operation = {};

        //selectApIp
        $scope.operation.selectApIp = '';

        $scope.aps = [];

        $scope.requestParams = {
            'command': 0,//id
            'hostname': ''//hostname
        };

        //show hostname flag
        $scope.showHostname = false;

        //result
        $scope.operation.result = '';

        $scope.initFuc = function() {
            $scope.aps = InterService.getCanConfigAps();
        };

        $scope.initFuc();


        //change tool
        $scope.changeTool = function() {
            //traceroute ping need showHostname
            
            var tem = $scope.requestParams.command;
            if(tem == 8 || tem == 9){
                $scope.showHostname = true;
                return;
            }

            $scope.showHostname = false;
            $scope.requestParams.hostname = '';

        };

        //tools exec
        $scope.exec = function(){

            //check
            if($scope.operation.selectApIp == ''){
                toastr.warning( $translate.instant("pleaseSelectAp"));
                return;
            }

            if($scope.requestParams.command == 0){
                toastr.warning($translate.instant("pleaseSelectTool"));
                return;
            }

            var tem = $scope.requestParams.command;
            if((tem == 8 || tem == 9) && $scope.requestParams.hostname == ''){
                toastr.warning($translate.instant("hostnameNotAllowEmpty"));
                return;
            }
            
            $scope.operation.result = '';
			
			var scheme = 'http://';
            var port = ':8080';
            var url = scheme + $scope.operation.selectApIp + port + "/other/tools";
            var timeout = '30000';//30s
            authentifiedRequest.request('post', url, null, $scope.requestParams, timeout, function(data){
                if(data != null && data.success){
                    $scope.operation.result = data.result;
                }else{

                    var msg = $translate.instant('Operate')+' '+$translate.instant('module_operate_failure');
                    //module_operate_success
                    $scope.operation.result = msg;
                }
                
            }, function(){
                var msg = $translate.instant('Operate')+' '+$translate.instant('module_operate_failure');
                $scope.operation.result = msg;
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }]);