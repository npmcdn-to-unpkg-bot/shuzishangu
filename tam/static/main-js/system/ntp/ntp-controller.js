angular.module('system')
	.controller("NTPContronller", ['$scope', '$translate', 'authentifiedRequest', 'batchSyncConfig', 'toastr','ntpTimeZoneConstant', function($scope, $translate, authentifiedRequest, batchSyncConfig, toastr,ntpTimeZoneConstant) {
        
        $scope.timeZoneArray = ntpTimeZoneConstant.utc;

        /* NTP */
        $scope.ntpConfig = {
            "dateTime": "",
            "timeZone": "",
            "ntpServerList":[],
            "city":""
        };

        /** datetime and timezone config param **/
        $scope.apDateTimeConfig = {
            selectTimeZone:'',
            dateTime:'',
            showPickerFlag:false,
            showTimezoneSelectFlag:false,
            modifyFlag:false
        };

        $scope.NTP_ServerIP_Temp = "";

        var ntpCurrentDatetime = $("#ntpDatetime");

        $scope.dynamicTime = function () {
            $scope.currentDatetime.setSeconds($scope.currentDatetime.getSeconds()+1);
           //var currentTime = $scope.currentDatetime.toUTCString();
            var len = $scope.currentDatetime.toTimeString().indexOf("GMT");
            var currentTime = $scope.currentDatetime.toDateString() + " " + $scope.currentDatetime.toTimeString().substr(0,len-1);
           ntpCurrentDatetime.text(currentTime);
        };


        //get ntp parameter
        $scope.time;
        $scope.ntpParamQuery = function(){
            authentifiedRequest.get("/network/ntpClient/confParams", null, function(data){
                if(data !=null && data.success){
                    $scope.ntpConfig = data.result;
                    $scope.setSelectTimeZone($scope.ntpConfig.city);
                    $scope.currentDatetime  = new Date($scope.ntpConfig.dateTime);
                    
                    if($scope.time){
                        clearInterval($scope.time);
                    }
                    //first display
                    $scope.dynamicTime();

                     //Interval display
                    $scope.time = setInterval($scope.dynamicTime, 1000);


                    // init picker $scope.ntpConfig.dateTime;
                    $scope.apDateTimeConfig.modifyFlag = true;

                }
            }, function(){
            });
        };


        $scope.setSelectTimeZone = function(city){
            if(city == null || city == ''){
                return '';
            }

            var arr = $scope.timeZoneArray;
            for(var i= 0, l = arr.length; i< l; i++){
                if(arr[i].indexOf(city+'@') != -1){
                    $scope.apDateTimeConfig.selectTimeZone = arr[i];
                    $scope.ntpConfig.timeZone = arr[i];
                    break;
                }
            }

        }

        /**
        * data init
        **/
        $scope.toggleManager.ntpInit = function(){
            $scope.ntpParamQuery(); 
        };

        /**
        * Interval Destory
        **/
        $scope.toggleManager.ntpDestory = function(){
            if($scope.time){
                clearInterval($scope.time);
                $scope.time = null;
            }

            $scope.ntpConfig = {
                "dateTime": "",
                "timeZone": "",
                "ntpServerList":[],
                "city":""
            };

            $scope.apDateTimeConfig = {
                selectTimeZone:'',
                dateTime:'',
                showPickerFlag:false,
                showTimezoneSelectFlag:false,
                modifyFlag:false
            };

            ntpCurrentDatetime.text("");
        };
      
        /**
         * Config NTP adjustment order
         */
        $scope.SyncNTPServerIPList= function(){
            var data = {'ntpServerList':[]};
            data.ntpServerList = $scope.ntpConfig.ntpServerList;
            var operatorMsg = 'ntp_log_adjustOrder';
            batchSyncConfig.request('put', '/network/ntpClient/ntpserver', null, data, function(){
                $scope.ntpParamQuery();
            },null,operatorMsg);
        };

        /**remove ntpserverIp**/
        $scope.removeNtpserver = function(ntpserver) {
            if($scope.ntpConfig.ntpServerList.length == 1){
                toastr.warning($translate.instant("ntpNotLess"));
                return;  
            };
            var operatorMsg = 'ntp_log_removeServer';
            var confirm_tip = $translate.instant("delNtpServer") + ntpserver + "?";
            bootbox.confirm(confirm_tip, function(result){
                if(result){
                    batchSyncConfig.request('delete', '/network/ntpClient/ntpserver/'+ntpserver, null, null, function(){
                        $scope.ntpParamQuery();
                    },null,operatorMsg);
                }
            });
        };

        /**add new ntpserverIp**/
        $scope.AddNTPServerIP = function() {
            var list = $scope.ntpConfig.ntpServerList;
            var flag = false;

            for(var i =0;i< list.length;i++){
                if (list[i] == $scope.NTP_ServerIP_Temp) {
                    flag = true;
                    toastr.warning($translate.instant("notAllowedRepetitionNtp"));
                    break
                }
            }

            if(flag){
                return;
            }
            var operatorMsg = 'ntp_log_addServer';
            var data = {"ntpserver":$scope.NTP_ServerIP_Temp};
            batchSyncConfig.request('post', '/network/ntpClient/ntpserver', null, data, function(){
                $scope.ntpParamQuery();
            },null,operatorMsg);
            $scope.NTP_ServerIP_Temp ='';
        };

        $scope.Moveup = function(index){
            $scope.temp = "";
            $scope.temp = $scope.ntpConfig.ntpServerList[index-1];
            $scope.ntpConfig.ntpServerList[index-1] = $scope.ntpConfig.ntpServerList[index];
            $scope.ntpConfig.ntpServerList[index] = $scope.temp;
            $scope.temp = "";
            $scope.SyncNTPServerIPList();
        };

        $scope.Movedown = function(index){

            $scope.temp =  $scope.ntpConfig.ntpServerList[index+1];
            $scope.ntpConfig.ntpServerList[index+1] = $scope.ntpConfig.ntpServerList[index];
            $scope.ntpConfig.ntpServerList[index] = $scope.temp;
            $scope.temp = "";
            $scope.SyncNTPServerIPList();
        };
        

        /**
         * [show hidden ApDatetimePicker]
         */
        $scope.showApDatetimePicker = function(flag){
            $scope.apDateTimeConfig.showPickerFlag = flag;
            if(flag){
               $('#apdatetimepicker').data("DateTimePicker").date($scope.currentDatetime);
            }
        };

        /**
         * [show hidden TimezoneSelect]
         */
        $scope.showTimezoneSelect = function(flag){
            $scope.apDateTimeConfig.showTimezoneSelectFlag = flag;
        };   

        /**
         * [modify current ap's Datetime]
         */
        $scope.modifyDatetime = function(){
            var dt = $scope.apDateTimeConfig.dateTime;
            var data = {'datetime':dt};
            var operatorMsg = 'ntp_log_modifyApDatetime';
            var confirm_tip = $translate.instant("updateApDatetime");
            bootbox.confirm(confirm_tip, function(result){
                if(result){
                    batchSyncConfig.request('put', '/network/ntpClient/datetime', null, data, function(){
                        $scope.ntpParamQuery();
                        $scope.showApDatetimePicker(false);
                    },null,operatorMsg);
                }
            });          
        };    

        /**
         * [modify cluster ap's Timzone]
         */
        $scope.modifyTimezone = function(){
            var timezone = $scope.apDateTimeConfig.selectTimeZone;
            if(timezone == null || timezone == ''){
                return;
            }

            var arr = timezone.split("@");
            var city = arr[0];
            var zone = arr[1];
            var data = {'timezone':zone,'city':city};
            var operatorMsg = 'ntp_log_modifyApTimezone';
            var confirm_tip = $translate.instant("updateApTimezone");

            bootbox.confirm(confirm_tip, function(result){
                if(result){
                    batchSyncConfig.request('put', '/network/ntpClient/timezone', null, data, function(){
                        $scope.ntpParamQuery();
                        $scope.showTimezoneSelect(false);
                    },null,operatorMsg);
                }
            });
            
        }; 


        $('#apdatetimepicker').datetimepicker({
            format: 'YYYY-MM-DD HH:mm:ss',
            useCurrent:false
        });

        $("#apdatetimepicker").on("dp.change", function (e) {
            $scope.apDateTimeConfig.dateTime = e.date.format("YYYY-MM-DD HH:mm:ss");
        });   

	}]);