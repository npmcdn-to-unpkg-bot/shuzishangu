angular.module('module.wireless.rogueAp')
    .filter("typeFilter", [function() {
        var filterfun = function(value) {
            switch(value){
                case 1:
                    return "Rogue";
                    break;
                case 0:
                    return "Interfering";
                    break;
            }
        };
        return filterfun;
    }])
    .filter("distanceFilter", [function() {
        var filterfun = function(value) {
            if(value < 25){
                return "farest";
            }else if((value >= 25) && (value <= 50)){
                return "far";
            }else if((value >= 51) && (value <= 75)){
                return "near";
            }else{
                return "nearest";
            }
        };
        return filterfun;
    }])
    .filter("authTypeFilter", [function() {
        var filterfun = function(value) {
            switch(value){
                case 0:
                    return "open";
                    break;
                case 1:
                    return "shared-key";
                    break;
                case 2:
                    return "WPA";
                    break;
                case 3:
                    return "WPA2/RSNA";
                    break;
                case false:
                    return "WAPI";
                    break;
            }
        };
        return filterfun;
    }])
    .filter("alreadyInBlackFilter", [function() {
        var filterfun = function(value) {
            switch(value){
                case 1:
                    return "Yes";
                    break;
                case 0:
                    return "No";
                    break;
            }
        };
        return filterfun;
    }])
    .controller('RogueApConfController', ['$scope', '$modalInstance','$translate', 'authentifiedRequest', 'InterService','batchSyncConfig', 'toastr', function($scope, $modalInstance,$translate, authentifiedRequest, InterService, batchSyncConfig, toastr) {
        $scope.skin = InterService.skin;
	    $scope.InterService = InterService;

        /**
         * RogueAp parameter init
         */
        $scope.whiteListParams = {};

        /**
         * remove duplicates by rogue ap mac and ssid
         */
        $scope.removeDuplicates = function(data){
            var oldArray = angular.copy($scope.rogueApListParams);

            for(var x=0; x<data.length; x++){
                var newMAC = data[x].MAC;
                var newSSID = data[x].SSID;
                var newRSSI = data[x].RSSI;

                for(var y=0; y<oldArray.length; y++){
                    if((newMAC == oldArray[y].MAC) && (newSSID == oldArray[y].SSID)){
                        if(newRSSI > oldArray[y].RSSI){
                            oldArray = oldArray.splice(y, 1);
                        }else{
                            data = data.splice(x, 1);
                        }

                        break;
                    }
                }
            }

            return oldArray.concat(data);
        };

        /**
         * http request to obtain the configuration of rogueAp
         */
        $scope.rogueApListParams=[];
        $scope.query = function(){
            var params ={};
            var firstLoop = true;

            /**
             * get ap list
             */
            var apList = InterService.getCanConfigAps();

            for(var i=0; i<apList.length; i++){
                var host = apList[i].ip;
                var mac = apList[i].mac;
                var url = "http://" + host + ":8080/rogueAps/" + mac;
                authentifiedRequest.get(url, params, function(response, status){
                    if(status == 200 && null != response && response.success){
                        if($scope.rogueApListParams.length == 0){
                            $scope.rogueApListParams = angular.copy(response.result);
                        }else{
                            $scope.rogueApListParams = $scope.removeDuplicates(response.result);
                        }

                        if((firstLoop) && ( response.result.length > 0)){
                            if($scope.whiteList == false){
                                $scope.rogueApDetail = true;
                            }
                            $scope.currentRogueAP = $scope.rogueApListParams[0];
                            firstLoop = false;
                        }
                    }
                }, function(){
                    //console.info('query rogueApListParams error!');
                });
            }
        };

        /**
         * call initialization method
         */
        $scope.query();

        /**
         * http request to obtain the configuration of whiteList
         */
        $scope.queryWhiteList = function(){
            var params ={};

            authentifiedRequest.get("/rogueApWhiteList", params, function(response, status){
                if(status == 200 && null != response && response.success){
                    $scope.whiteListParams = response.result;
                }
            }, function(){
                //console.info('query whiteListParams error!');
            });
        };

        /**
         * close button
         */
        $scope.cancel = function() {
            $scope.rogueApDetail = false;
            $scope.rogueApClientNum = false;
            $scope.whiteList = false;
            $modalInstance.close();
        };

        /**
         * show rogue ap detail div
         */
        $scope.rogueApDetail = false;
        $scope.rogueApClientNum = false;
        $scope.whiteList = false;
        $scope.showDetail = function(item){
            $scope.rogueApDetail = true;
            $scope.rogueApClientNum = false;
            $scope.whiteList = false;
            $scope.currentRogueAP = item;
        };

        /**
         * show whiteList div
         */
        $scope.submitPara={};
        $scope.showWhiteList = function(){
            $scope.rogueApDetail = false;
            $scope.rogueApClientNum = false;
            $scope.whiteList = true;
            $scope.submitPara.whitelistValue = "";
            $scope.queryWhiteList();
        };

        $scope.isWhiteListRepeat = function(whiteList, whitelistValue){
            for (var i = 0; i < whiteList.length; i++) {
                if(whitelistValue == whiteList[i].whitelistMac){
                    return true
                }
            }

            return false;
        };

        /**
         * Add Whitelist
         */
        $scope.addWhitelist = function(){
            $scope.parasedSubmitPara = {
                whitelistValue: ""
            };
            var value = $scope.submitPara.whitelistValue;
            if(value){
                var r =  RegExp(":", "gi");
                var len = 0;
                var result = value.match(r);
                if(result == null){
                    len = 0;
                }else{
                    len = result.length;
                }
                switch(len){
                    case 0:
                        $scope.parasedSubmitPara.whitelistValue  = value.concat(":*:*:*:*:*");
                        break;
                    case 1:
                        $scope.parasedSubmitPara.whitelistValue  = value.concat(":*:*:*:*");
                        break;
                    case 2:
                        $scope.parasedSubmitPara.whitelistValue  = value.concat(":*:*:*");
                        break;
                    case 3:
                        $scope.parasedSubmitPara.whitelistValue  = value.concat(":*:*");
                        break;
                    case 4:
                        $scope.parasedSubmitPara.whitelistValue  = value.concat(":*");
                        break;
                    case 5:
                        $scope.parasedSubmitPara.whitelistValue  = value;
                        break;
                }
                var requestParas = JSON.stringify($scope.parasedSubmitPara);
                var whitelistValue = $scope.parasedSubmitPara.whitelistValue.toLowerCase();
                var isRepeat = $scope.isWhiteListRepeat($scope.whiteListParams.whitelist, whitelistValue);

                if(isRepeat){
                    toastr.info($translate.instant("whiteListMacRepeat"), '');
                }else if(20 == $scope.whiteListParams.whitelistNum){
                    toastr.info($translate.instant("whiteListMacAlready20"), '');
                }else{
                    var operatorMsg = "rogueAp_add_whiteList";
                    var logtemp = $scope.parasedSubmitPara.whitelistValue;

                    batchSyncConfig.request("post", "/rogueApWhiteList", null, requestParas, function(){
                        $scope.queryWhiteList();
                        $scope.rogueApListParams=[];
                        $scope.query();
                    }, null, operatorMsg, null, logtemp);
                }

                $scope.submitPara.whitelistValue = "";
            }

        };

        /**
         * trust
         */
        $scope.trust = function(whitelistValue){
            var requestParas = { "whitelistValue": whitelistValue };
            var operatorMsg = "rogueAp_add_whiteList";
            var logtemp = whitelistValue;
            var confirm_tip = $translate.instant("trustThisAp")+"("+ whitelistValue + ")?";

            bootbox.confirm(confirm_tip, function(result){
               if(result){
                   batchSyncConfig.request("post", "/rogueApWhiteList", null, requestParas, function(){
                       $scope.queryWhiteList();
                       $scope.rogueApListParams=[];
                       $scope.query();
                   }, null, operatorMsg, null, logtemp);
               }
            });

        };

        /**
         * delete whiteList
         */
        $scope.deleteWhitelist = function(item){
            var operatorMsg = "rogueAp_delete_whiteList";
            var logtemp = item;
            var confirm_tip =  $translate.instant("deleteWhiteListMac")+item+"?"

            bootbox.confirm(confirm_tip, function(result){
                if(result){
                    batchSyncConfig.request("delete", "/rogueApWhiteList/"+item, null, null, function(){
                        $scope.queryWhiteList();
                        $scope.rogueApListParams=[];
                        $scope.query();
                    }, null, operatorMsg, null, logtemp);
                }
            });

        };
    }]);