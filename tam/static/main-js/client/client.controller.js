/**
 * Created by shensf on 2016/3/25.
 */
angular.module("module.client", [])
    .controller("ClientController", ['$scope', 'batchSyncConfig', 'clientService', 'monitorService', 'singleModal', function($scope, batchSyncConfig, clientService, monitorService, singleModal) {

        $scope.clientList = [];
        $scope.clientNum = 0;
        $scope.divWidth="";
        $scope.flag = 'cluster';

        $scope.clientManagement.changeClient = function(info, data){

            if(info == 'ap'){
                $scope.flag = 'ap';
                $scope.clientList = clientService.getApClient(data);
            }else if(info == 'wlan'){
                $scope.flag = 'wlan';
                $scope.clientList = clientService.getWlanClient(data);
            }else {
                $scope.flag = 'cluster';
                $scope.clientList = clientService.getClientList();
            }
            if(0 < $scope.clientList.length){
                $scope.clientNum = $scope.clientList.length;
                if(4 < $scope.clientNum.length){
                    $scope.divWidth="padding-right:17px;";
                }else{
                    $scope.divWidth="";
                }
            }else{
                $scope.clientNum = 0;
                $scope.clientList = [];
                $scope.divWidth="";
            }
        }

        $scope.clientManagement.query = function(clientCallback) {
            batchSyncConfig.getAll("/totalclientlist", null, function(results) {
                // if(0 < results.length){
                //     $scope.clientList = results;
                //     $scope.clientNum = results.length;
                //     if(4 < results.length){
                //         $scope.divWidth="padding-right:17px;";
                //     }else{
                //         $scope.divWidth="";
                //     }
                // }else{
                //     $scope.clientNum = 0;
                //     $scope.clientList = [];
                //     $scope.divWidth="";
                // }
                clientService.setClientList(results);
                $scope.clientManagement.changeClient($scope.flag, '');
                clientCallback();
            });

        }

        $scope.clientManagement.query($scope.clientCallback);
        /**
         *
         */
        $scope.openClientPageInit = function() {
                singleModal.open({
                    templateUrl: 'client/client-detail.html',
                    controller: 'ClientDetailController',
                    size: 'lg',
                    backdrop: 'static'
                },function(result){
                     $scope.clientManagement.query($scope.clientCallback);
                },function(reason){
                     $scope.clientManagement.query($scope.clientCallback);
                });
        };

        /**
         * 进行client monitor信息展示
         */
        $scope.showClientMonitor = function(item) {
            var title = 'client:' + item.UserMAC;
            monitorService.changeObser('client', item.UserMAC, title);
        }
    }]);