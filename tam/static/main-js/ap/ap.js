angular.module('module.ap.apinfo', [])
    .service('APService', ['authentifiedRequest', 'batchSyncConfig', 'InterService', 'clientService',
                function(authentifiedRequest, batchSyncConfig, InterService, clientService) {
        var vm = this;

        vm.HttpGetApListInfo = function(callbackFuction) {
            var pvcinfo = InterService.getPVCinfo();
            var url="";
            if(pvcinfo==null||pvcinfo==''){
                url = "/haps";
            }else{
                url = "http://" + pvcinfo.ip + ":8080/haps";
            }
            authentifiedRequest.get(url, null, function(data) {
                var res = data.result;
                if (data != null && data.success && res != null) {
                    for(var i=res.length; i> 0 ;i-- ){
                        
                        res[i-1].apname=res[i-1].mac;
                        if(res[i-1].state == 0){
                            res[i-1].state="1";
                        }
                        var apsClients = clientService.getApClient(res[i-1].mac);
                        if(null != apsClients){
                            res[i-1].clients = apsClients.length;
                        }else {
                            res[i-1].clients = 0;
                        }
                    }
                    InterService.setInterApListInfo(res);
                    batchSyncConfig.getAll("/getapname",null,function(response){
                        for(var inter_res=0; inter_res<response.length; inter_res++){
                            var resmac = response[inter_res].mac.toUpperCase() ;
                            for(var inter=res.length; inter> 0 ;inter-- ){
                                var mac = res[inter-1].mac.toUpperCase() ;
                                if( mac == resmac ){
                                    if((response[inter_res].apname=='') || (response[inter_res].apname ==null)){
                                        res[inter-1].apname=res[inter-1].mac;
                                    }else{
                                        res[inter-1].apname=response[inter_res].apname;
                                    }
                                    break;
                                }
                            }
                        }
                        InterService.setApListInfo(res);
                        if(callbackFuction != null){
                            callbackFuction();
                        }
                    });
                }
            }, function() {
            });
        }
    }])
    .controller('APController', ['$scope', '$rootScope','$translate', 'InterService', 'authentifiedRequest',
        'clientService', 'monitorService','lockScreen','singleModal', 'operationLog', 'APService','toastr',
        function($scope, $rootScope,$translate, InterService, authentifiedRequest, clientService, monitorService,
                 lockScreen,singleModal, operationLog, APService,toastr) {

        $scope.InterService = InterService;
        var url_pro = "http://";
        var url_port= ":8080";
        $scope.apInfo = {
            "working": "0",
            "lost": "0",
            "joining": "0"
        };
        $scope.aps = InterService.getApListInfo();

        statisticApState();
        $scope.apsWidth="";
         function setApsWidth(){
            if($scope.aps.length > 7){
                $scope.apsWidth="padding-right:17px";
            }else{
                $scope.apsWidth="";
            }
        }
         setApsWidth();
        function statisticApState() {
            var work = 0;
            var join = 0;
            var lost = 0;
            for (var j = 0; j < $scope.aps.length; j++) {
                switch ($scope.aps[j].state) {
                    case "1":
                        join++;
                        break;
                    case "2":                        
                    case "3":
                        work++;
                        break;
                    case "4":
                        lost++;
                        break;
                    default:
                        break;
                }
            }
            $scope.apInfo = {
                "working": work,
                "lost": lost,
                "joining": join
            };
            setApsWidth();
        }


        /**/
        $scope.modal = null;
        $scope.openApinfo = function() {
            singleModal.open({
                    templateUrl: 'ap/aplist.html',
                    controller: 'APinfoController',
                    size: 'lg',
                    backdrop: true
            });
        };
        /*接入ap*/
        $scope.acceptAp = function(item) {
            var bodyParas = {
                "mac": item.mac
            };
            var cluster_num = $scope.aps.length - $scope.apInfo.joining;
            if(cluster_num <16){
                bootbox.confirm($translate.instant("joingAp"), function(result) {
                    if(result) {
                        lockScreen.lock();
                        var operatorMsg = "ap_access_group_name";
                        var loginfo = [{
                            'ip':"PVC",
                            'success':"module_operate_failure",
                            'msg':''}];
                        authentifiedRequest.put("/toauth", null, bodyParas, function(response) {
                            if (response != null && response.success) {
                                toastr.info($translate.instant("successfullyAp"), '');
                                APService.HttpGetApListInfo(null);
                                loginfo[0].success = "module_operate_success";
                                loginfo[0].msg = "ap_log_success";
                                lockScreen.unlock();
                            } else {
                                toastr.info($translate.instant("failedAp"), '');
                                loginfo[0].success = "module_operate_failure";
                                loginfo[0].msg = "ap_log_error_1";
                                lockScreen.unlock();
                            }
                            operationLog.setLog(operatorMsg, loginfo);
                        }, function() {
                            toastr.info($translate.instant("failedServer"), '');
                            loginfo[0].success = "module_operate_failure";
                            loginfo[0].msg = 'failedServer';
                            operationLog.setLog(operatorMsg, loginfo);
                            lockScreen.unlock();
                        });
                    }
                });
            }else{
                toastr.warning($translate.instant("apgroupFull"), '');
            }
        };

        $scope.ShowLedOperate = function(item) {
            item.ledshow = !item.ledshow;
            if(item.ledshow){
                var url = url_pro + item.ip + url_port+"/ledstatus";
                authentifiedRequest.get(url, null, function(response){
                    if(response != null && response.success){
                        switch(response.result){
                            case 0:
                                item.operate = {"open": false, "off": true, "blink": false};
                                break;
                            case 1:
                                item.operate = {"open": true, "off": false, "blink": false};
                                break;
                            case 2:
                                item.operate = {"open": false, "off": false, "blink": true};
                                break;
                        }
                    }
                }, function(){});
            }
        }

        $scope.LedOperate = function(item, type) {
            var bodyParas = {
                "type": type
            };
            var confirm="";
            switch(type){
                case 100:
                    confirm=$translate.instant("locateAp");
                    break;
                case 101:
                    confirm=$translate.instant("restoreAp");
                    break;
                case 102:
                    confirm= $translate.instant("onLedAp");
                    break;
                case 103:
                    confirm=$translate.instant("offLedAp");
                    break;
            }
            var url = url_pro + item.ip + url_port +"/ledControl";
            bootbox.confirm(confirm, function(result) {
                if(result) {
                    lockScreen.lock();
                    var operatorMsg = "set_led_status_log_name";
                    var loginfo = [{
                        'ip':item.ip,
                        'success':"module_operate_failure",
                        'msg':''}];
                    authentifiedRequest.put(url, null, bodyParas, function(response) {
                        if (response != null && response.success) {
                            switch(type){
                                case 100:
                                    item.operate = {"open": false, "off": false, "blink": true};
                                    break;
                                case 101:
                                    item.operate = {"open": true, "off": false, "blink": false};
                                    break;
                                case 102:
                                    item.operate = {"open": true, "off": false, "blink": false};
                                    break;
                                case 103:
                                    item.operate = {"open": false, "off": true, "blink": false};
                                    break;
                            }
                            loginfo[0].success = "module_operate_success";
                            loginfo[0].msg = 'ap_log_success';
                            lockScreen.unlock();
                        } else {
                            toastr.warning($translate.instant("setApLedF"), '');
                            loginfo[0].success = "module_operate_failure";
                            loginfo[0].msg = "ap_log_error_1";
                            lockScreen.unlock();
                        }
                        operationLog.setLog(operatorMsg, loginfo);
                    }, function() {
                        toastr.warning($translate.instant("failedServer"), '');
                        loginfo[0].success = "module_operate_failure";
                        loginfo[0].msg = 'failedServer';
                        operationLog.setLog(operatorMsg, loginfo);
                        lockScreen.unlock();
                    });
                }
            });
        }

        /*$scope.$watch('InterService.aplistinfo', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.aps = InterService.getApListInfo();
                statisticApState();
            }
        }, true);*/

        $scope.$on('to-aplist-child', function(event,data) {
            console.log('to-aplist-child');
            $scope.aps = InterService.getApListInfo();
            statisticApState();
        });

        
        /**
         * showApMonitorData
         */
        $scope.showApMonitorData = function(item) {
            var title = 'AP:' + item.mac;
            var data = new Array();
            data['ip'] = item.ip;
            data['mac'] = item.mac;
            monitorService.changeObser('ap', data, title);
            $scope.clientManagement.changeClient('ap', item.mac);
        }

    }])
    .filter("apStatusFilter", [function() {
        var filterfun = function(value) {
            switch (value) {
                case "1":
                    return "Joining";
                    break;
                case "2":
                    return "Initializing";
                    break;
                case "3":
                    return "Working";
                    break;
                case "4":
                    return "Down";
                    break;
            }
        };
        return filterfun;
    }]);