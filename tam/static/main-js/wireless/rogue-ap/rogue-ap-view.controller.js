angular.module('module.wireless.rogueAp',[])
    .controller('RogueApViewController', ['$scope', 'singleModal', 'authentifiedRequest', 'InterService', 'batchSyncConfig', function($scope, singleModal, authentifiedRequest, InterService, batchSyncConfig) {
        /**
         * RogueAp parameter init
         */
        $scope.rogueApParams = {
            "suppressSwitch" : false,
            "blackSwitch" : false
        };

        $scope.rogueApData=[];

        $scope.toolTipContentFunction = function(){
            return function(key, x, y, e, graph) {
                return '<b>' + key + '</b>' + ' have <b>' + parseInt(y) + '</b> ' + x;
            }
        };

        $scope.yAxisTickFormatFunction = function(){
            return function(d){
                return parseInt(d);
            }
        };

        /**
         * combination chart data
         */
        var rogueAp=[];
        function getRogueApData(data){
            //alert(JSON.stringify(data));
            var obj = new Object();
            obj.key = data[0].hapMac;
            obj.total = 0;
            obj.values = [["Interfering AP" , 0], ["Rogue AP" , 0]];
            for(var i=0; i<data.length; i++){
                if(0 === data[i].TYPE){
                    obj.values[0][1]++;
                }else{
                    obj.values[1][1]++;
                }
                obj.total++;
            }
            rogueAp.push(obj);
            //alert(JSON.stringify(rogueAp));
        };

        $scope.sortRogueApData = function(data){
            /*Interfering AP + Rogue AP arranged in descending order*/
            data.sort(function(a,b){
                return b.total-a.total});

            /*get the first 5 data*/
            $scope.rogueApData = data.slice(0,5);
        };

        $scope.toggleManager.rogueApInit = function(){
            $scope.suppressQuery();
            $scope.query();
        };

        /**
         * http request to obtain the configuration of rogueAp
         */
        $scope.suppressQuery = function(){
            var params ={};

            authentifiedRequest.get("/rogueApSwitch", params, function(response, status){
                if(status == 200 && null != response && response.success){
                    $scope.rogueApParams = response.result;
                }
            }, function(){
                //console.info('query rogueAp switch error!');
            });
        };

        $scope.query = function(){
            var params = {};
            rogueAp = [];

            /**
             * get ap list
             */
            var apList = InterService.getCanConfigAps();

            for(var i=0; i<apList.length; i++){
                var host = apList[i].ip;
                mac = apList[i].mac;
                var url = "http://" + host + ":8080/rogueAps/" + mac;
                authentifiedRequest.get(url, params, function(response, status){
                    if(status == 200 && null != response && response.success){
                        getRogueApData(response.result);
                    }

                    if(i == apList.length){
                        $scope.sortRogueApData(rogueAp);
                    }
                }, function(){
                    //console.info('query rogueApListParams error!');
                });
            }
        };

        /**
         * open modal
         */
        $scope.modal = null;
        $scope.openConfigPage = function(){
            singleModal.open({
                templateUrl: 'wireless/rogue-ap/rogue-ap-conf.html',
                controller: 'RogueApConfController',
                size:'lg',
                backdrop:'static'
            });
        };

        $scope.configSuppressSwitch = function() {
            var requestParas = JSON.stringify($scope.rogueApParams);
            var operatorMsg;
            if($scope.rogueApParams.suppressSwitch){
                operatorMsg = "rogueAp_edit_suppressSwitch_1";
            }else{
                operatorMsg = "rogueAp_edit_suppressSwitch_2";
            }

            batchSyncConfig.request("put", "/suppressSwitch", null, requestParas, function(){
                $scope.suppressQuery();
            }, null, operatorMsg);
        };

        $scope.configBlackSwitch = function() {
            var requestParas = JSON.stringify($scope.rogueApParams);
            var operatorMsg;
            if($scope.rogueApParams.blackSwitch){
                operatorMsg = "rogueAp_edit_blackSwitch_1";
            }else{
                operatorMsg = "rogueAp_edit_blackSwitch_2";
            }

            batchSyncConfig.request("put", "/blackSwitch", null, requestParas, function(){
                $scope.suppressQuery();
            }, null, operatorMsg);
        };
    }]);