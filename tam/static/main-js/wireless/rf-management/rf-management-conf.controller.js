angular.module('module.wireless.rfManagement')
    .filter("channelPowerFilter", [function() {
        var filterfun = function(value) {
            if(null === value){
                return "waiting";
            }else{
                return value;
            }
        };
        return filterfun;
    }])
    .controller('RfManagementConfController', ['$scope', '$modalInstance', 'authentifiedRequest', 'InterService', 'lockScreen', 'operationLog', function($scope, $modalInstance, authentifiedRequest, InterService, lockScreen, operationLog) {
        $scope.skin = InterService.skin;
	    $scope.InterService = InterService;

        /**
         * RfManagement parameter init
         */
        $scope.apListParams = {};

        /**
         * supported 2g channels by country
         */
        $scope.Channel0_US = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        $scope.Channel0_JP = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        $scope.Channel0_DE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        $scope.Channel0_CS = [];

        /**
         * supported 5g channels by country
         */
        $scope.Channel1_US = [36, 40, 44, 48, 149, 153, 157, 161, 165];
        $scope.Channel1_CA = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165];
        $scope.Channel1_JP = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140];
        $scope.Channel1_KR = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161];
        $scope.Channel1_CN = [36, 40, 44, 48, 52, 56, 60, 64, 149, 153, 157, 161, 165];
        $scope.Channel1_TW = [56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 149, 153, 157, 161, 165];
        $scope.Channel1_IL = [36, 40, 44, 48, 52, 56, 60, 64];
        $scope.Channel1_BO = [52, 56, 60, 64, 140, 149, 153, 157, 161, 165];
        $scope.Channel1_ID = [149, 153, 157, 161];
        $scope.Channel1_PK = [149, 153, 157, 161, 165];
        $scope.Channel1_DZ = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132];

        $scope.ChannelScope0 = [];
        $scope.select2gChannelScope = function(country){
            switch (country){
                case "JP":
                    $scope.ChannelScope0 = $scope.Channel0_JP;
                    break;
                case "DE":
                case "NL":
                case "IT":
                case "PT":
                case "LU":
                case "NO":
                case "FI":
                case "DK":
                case "CH":
                case "CZ":
                case "ES":
                case "GB":
                case "KR":
                case "CN":
                case "FR":
                case "HK":
                case "SG":
                case "BR":
                case "IL":
                case "SA":
                case "LB":
                case "AE":
                case "ZA":
                case "AR":
                case "AU":
                case "AT":
                case "BO":
                case "CL":
                case "GR":
                case "IS":
                case "IN":
                case "KW":
                case "LI":
                case "LT":
                case "MX":
                case "MA":
                case "NZ":
                case "PL":
                case "SK":
                case "EE":
                case "MU":
                case "RO":
                case "ID":
                case "PE":
                case "VE":
                case "JM":
                case "BH":
                case "OM":
                case "JO":
                case "CO":
                case "GT":
                case "PH":
                case "LK":
                case "SV":
                case "TN":
                case "PK":
                case "QA":
                case "DZ":
                    $scope.ChannelScope0 = $scope.Channel0_DE;
                    break;
                case "CS":
                    $scope.ChannelScope0 = $scope.Channel0_CS;
                    break;
                default :
                    $scope.ChannelScope0 = $scope.Channel0_US;
                    break;
            }
        };

        $scope.ChannelScope1 = [];
        $scope.select5gChannelScope = function(country){
            switch (country){
                case "CA":
                case "HK":
                case "SG":
                case "BR":
                case "LB":
                case "AE":
                case "ZA":
                case "AR":
                case "AU":
                case "MX":
                case "NZ":
                case "PR":
                case "MU":
                case "CS":
                case "PE":
                case "JM":
                case "BM":
                case "CO":
                case "PH":
                case "LK":
                    $scope.ChannelScope1 = $scope.Channel1_CA;
                    break;
                case "JP":
                case "DE":
                case "NL":
                case "IT":
                case "PT":
                case "LU":
                case "NO":
                case "FI":
                case "DK":
                case "CH":
                case "CZ":
                case "ES":
                case "GB":
                case "FR":
                case "SA":
                case "AT":
                case "GR":
                case "IS":
                case "LI":
                case "LT":
                case "PL":
                case "SK":
                case "EE":
                case "RO":
                case "OM":
                case "GT":
                    $scope.ChannelScope1 = $scope.Channel1_JP;
                    break;
                case "KR":
                    $scope.ChannelScope1 = $scope.Channel1_KR;
                    break;
                case "CN":
                case "CL":
                case "IN":
                case "VE":
                case "BH":
                case "DO":
                case "SV":
                    $scope.ChannelScope1 = $scope.Channel1_CN;
                    break;
                case "TW":
                    $scope.ChannelScope1 = $scope.Channel1_TW;
                    break;
                case "IL":
                case "KW":
                case "MA":
                case "TN":
                    $scope.ChannelScope1 = $scope.Channel1_IL;
                    break;
                case "BO":
                    $scope.ChannelScope1 = $scope.Channel1_BO;
                    break;
                case "ID":
                    $scope.ChannelScope1 = $scope.Channel1_ID;
                    break;
                case "PK":
                case "QA":
                    $scope.ChannelScope1 = $scope.Channel1_PK;
                    break;
                case "DZ":
                    $scope.ChannelScope1 = $scope.Channel1_DZ;
                    break;
                default :
                    $scope.ChannelScope1 = $scope.Channel1_US;
                    break;
            }
        };

        $scope.initDivShow = function(){
            $scope.rfDetail = false;
            $scope.rfEdit = false;
        };
        $scope.initDivShow();

        /**
         * http request to obtain the configuration of RF
         */
        $scope.apListParams=[];
        $scope.query = function(editMac){
            var params ={};
            var firstLoop = true;

            /**
             * get ap list
             */
            var apList = InterService.getCanConfigAps();

            for(var i=0; i<apList.length; i++){
                var host = apList[i].ip;
                var mac = apList[i].mac;
                var url = "http://" + host + ":8080/rf/" + mac;
                authentifiedRequest.get(url, params, function(response, status){
                    if (status == 200 && null != response && response.success){
                        $scope.apListParams.push(response.result);
                        if(firstLoop){
                            $scope.rfDetail = true;
                            if(("" != editMac) && (editMac == mac)){
                                $scope.currentAP = response.result;
                            }else if("" == editMac){
                                $scope.currentAP = $scope.apListParams[0];
                            }
                            firstLoop = false;
                        }

                    }
                }, function(){
                    //console.info('query rf error!');
                });
            }
        };

        /**
         * call initialization method
         */
        $scope.query("");

        /**
         * config RF
         */
        $scope.save = function() {
            /**
             * lock screen
             */
            lockScreen.lock();

            var host = $scope.currentAP.host;
            var url = "http://" + host + ":8080/rf";
            var params ={};
            var requestParas = JSON.stringify($scope.currentAP);

            authentifiedRequest.put(url, params, requestParas, function(response){
                /**
                 * unlock screen
                 */
                lockScreen.unlock();

                $scope.initDivShow();
                $scope.rfDetail=true;
                $scope.apListParams=[];
                $scope.query($scope.currentAP.mac);
                
                var operatorMsg = "rf_edit";
                var logtemp = $scope.currentAP.mac;
                var loginfo = [{
                    'ip':host,
                    'success':"module_operate_failure",
                    'msg':''}];
                if(response == null || response == ''){
                    loginfo[0].success = "module_operate_failure";
                    loginfo[0].msg = 'log_backendServer_error';
                }else{
                    if(response.success){
                        loginfo[0].success = "module_operate_success";
                    }else{
                        loginfo[0].success = "module_operate_failure";
                    }
                    loginfo[0].msg = response.msg;
                }
                operationLog.setLog(operatorMsg, loginfo, logtemp);
            }, function(){
                //console.info('edit rf error!');
                /**
                 * unlock screen
                 */
                lockScreen.unlock();
            });
        };

        /**
         * close button
         */
        $scope.cancel = function() {
            $modalInstance.close();
        };

        /**
         * show RF detail div
         */
        $scope.showDetail = function(item){
            $scope.rfDetail = true;
            $scope.rfEdit = false;
            $scope.currentAP = item;
        };

        /**
         * show RF config div
         */
        $scope.showEdit = function(item){
            $scope.rfDetail = false;
            $scope.rfEdit = true;
            $scope.currentAP = angular.copy(item);
            $scope.select2gChannelScope(item.country);
            $scope.select5gChannelScope(item.country);
        };
    }]);