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
    .controller('RfManagementConfController', ['$scope', '$modalInstance', 'authentifiedRequest', 'InterService', 'lockScreen', 'operationLog', 'toastr', '$translate', function($scope, $modalInstance, authentifiedRequest, InterService, lockScreen, operationLog, toastr, $translate) {
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
        $scope.Channel1_US = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 149, 153, 157, 161];
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

        function parseURL(url) {
            var a =  document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':',''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function(){
                    var ret = {},
                        seg = a.search.replace(/^\?/,'').split('&'),
                        len = seg.length, i = 0, s;
                    for (;i<len;i++) {
                        if (!seg[i]) { continue; }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
                hash: a.hash.replace('#',''),
                path: a.pathname.replace(/^([^\/])/,'/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
                segments: a.pathname.replace(/^\//,'').split('/')
            }
        };

        function getApInfo(apList, host){
            for(var i=0; i<apList.length; i++){
                if(host == apList[i].ip){
                    return apList[i];
                }
            }
        };

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
                var url = "http://" + host + ":8080/rf";
                authentifiedRequest.get(url, params, function(response, status, config, headers){
                    if (status == 200 && null != response && response.success){
                        var responseHost = parseURL(headers.url).host;;
                        var apInfo = getApInfo(apList, responseHost);
                        response.result.host = apInfo.ip;
                        response.result.apInfo = apInfo.apname;
                        response.result.apName = apInfo.name;
                        response.result.mac = apInfo.mac;

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
        $scope.newCurrentAP = {};
        $scope.save = function() {
            /**
             * lock screen
             */
            lockScreen.lock();

            var host = $scope.currentAP.host;
            var url = "http://" + host + ":8080/rf";
            var params ={};

            $scope.newCurrentAP.host = $scope.currentAP.host;
            $scope.newCurrentAP.apInfo = $scope.currentAP.apInfo;
            $scope.newCurrentAP.apName = $scope.currentAP.apName;
            $scope.newCurrentAP.mac = $scope.currentAP.mac;
            $scope.newCurrentAP.country = $scope.currentAP.country;

            if($scope.oldAP.acsSwitch_2g != $scope.currentAP.acsSwitch_2g){
                if("ON" == $scope.currentAP.acsSwitch_2g){
                    $scope.newCurrentAP.channel_2g = "auto";
                }else{
                    $scope.newCurrentAP.channel_2g = $scope.currentAP.channel_2g;
                }
            }else{
                if(($scope.oldAP.channel_2g != $scope.currentAP.channel_2g) && ("OFF" == $scope.currentAP.acsSwitch_2g)){
                    $scope.newCurrentAP.channel_2g = $scope.currentAP.channel_2g;
                }
            }

            if($scope.oldAP.acsSwitch_5g != $scope.currentAP.acsSwitch_5g){
                if("ON" == $scope.currentAP.acsSwitch_5g){
                    $scope.newCurrentAP.channel_5g = "auto";
                }else{
                    $scope.newCurrentAP.channel_5g = $scope.currentAP.channel_5g;
                }
            }else{
                if(($scope.oldAP.channel_5g != $scope.currentAP.channel_5g) && ("OFF" == $scope.currentAP.acsSwitch_5g)){
                    $scope.newCurrentAP.channel_5g = $scope.currentAP.channel_5g;
                }
            }

            if($scope.oldAP.apcSwitch_2g != $scope.currentAP.apcSwitch_2g){
                if("ON" == $scope.currentAP.apcSwitch_2g){
                    $scope.newCurrentAP.power_2g = "auto";
                }else{
                    $scope.newCurrentAP.power_2g = $scope.currentAP.power_2g;
                }
            }else{
                if(($scope.oldAP.power_2g != $scope.currentAP.power_2g) && ("OFF" == $scope.currentAP.apcSwitch_2g)){
                    $scope.newCurrentAP.power_2g = $scope.currentAP.power_2g;
                }
            }

            if($scope.oldAP.apcSwitch_5g != $scope.currentAP.apcSwitch_5g){
                if("ON" == $scope.currentAP.apcSwitch_5g){
                    $scope.newCurrentAP.power_5g = "auto";
                }else{
                    $scope.newCurrentAP.power_5g = $scope.currentAP.power_5g;
                }
            }else{
                if(($scope.oldAP.power_5g != $scope.currentAP.power_5g) && ("OFF" == $scope.currentAP.apcSwitch_5g)){
                    $scope.newCurrentAP.power_5g = $scope.currentAP.power_5g;
                }
            }
            var requestParas = JSON.stringify($scope.newCurrentAP);

            authentifiedRequest.put(url, params, requestParas, function(response){
                /**
                 * unlock screen
                 */
                lockScreen.unlock();

                $scope.initDivShow();
                $scope.rfDetail=true;
                $scope.apListParams=[];
                $scope.query($scope.currentAP.mac);
                $scope.newCurrentAP = {};

                var operatorMsg = "rf_edit";
                var logtemp = $scope.currentAP.mac;
                var loginfo = [{
                    'ip':host,
                    'success':"module_operate_failure",
                    'msg':''}];
                if(response == null || response == ''){
                    loginfo[0].success = "module_operate_failure";
                    loginfo[0].msg = 'log_backendServer_error';
                    toastr.info($translate.instant("log_backendServer_error"));
                }else{
                    if(response.success){
                        loginfo[0].success = "module_operate_success";
                    }else{
                        loginfo[0].success = "module_operate_failure";
                    }
                    loginfo[0].msg = response.msg;
                    toastr.info($translate.instant(response.msg));
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
        $scope.oldAP = {};
        $scope.showEdit = function(item){
            $scope.rfDetail = false;
            $scope.rfEdit = true;
            $scope.currentAP = angular.copy(item);
            $scope.oldAP = angular.copy(item);
            $scope.select2gChannelScope(item.country);
            $scope.select5gChannelScope(item.country);
        };
    }]);