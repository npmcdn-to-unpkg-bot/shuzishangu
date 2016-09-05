angular.module('login')
    .run(['$rootScope',function($rootScope) {
        // lock screen initialization
        $rootScope.loading = false;
    }])
    .controller("loginCtrl", ['$translate', '$http', '$scope', '$modal', 'toastr', 'wizardService','$cookieStore','$timeout', function($translate, $http, $scope, $modal, toastr, wizardService,$cookieStore,$timeout) {
        //internationalization
        $scope.isEnglish  = true;
        $scope.isChiness = false;
        $scope.isBoth = false;
        window.localStorage.countryCode = "";

        getLang();
        //get user select language
        function getLang (){
            if($cookieStore.get("lang") == null||$cookieStore.get("lang") == "en"){
                $scope.isEnglish  = true;
                $scope.isChiness = false;
                $scope.isBoth = false;
            }else if($cookieStore.get("lang") == "zh"){
                $scope.isEnglish  = false;
                $scope.isChiness = true;
                $scope.isBoth = false;
            }
        }

        $scope.setLang = function(langKeyNum) {
            var langKey = "en_US";
            switch (langKeyNum){
                case 0:
                    langKey = "en_US";
                    $cookieStore.put("lang","en");
                    $scope.isEnglish  = false;
                    $scope.isChiness = false;
                    $scope.isBoth = true;
                    break;
                case 1:
                    langKey = "zh_CH";
                    $cookieStore.put("lang","zh");
                    $scope.isEnglish  = false;
                    $scope.isChiness = false;
                    $scope.isBoth = true;
                    break;
                case 2:
                    langKey = "en_US";
                    $cookieStore.put("lang","en");
                    $scope.isEnglish  = true;
                    $scope.isChiness = false;
                    $scope.isBoth = false;
                    break;
                case 3:
                    langKey = "zh_CH";
                    $cookieStore.put("lang","zh");
                    $scope.isEnglish  = false;
                    $scope.isChiness = true;
                    $scope.isBoth = false;
                    break;
            }
            $translate.use(langKey);
        };






        $scope.rolesddd = [{
            id: 1,
            name: "Administrator"
        }, {
            id: 2,
            name: "Viewer"
        }, {
            id: 3,
            name: "GuestOperator"
        }];
        window.localStorage.sessionId = 'no session';
        initrrrr();
        //define request params object
        $scope.loginParam = {
            "username": "",
            "password": "",
            "button_clicked ":false
        };

        function initrrrr() {
            $scope.selectedRole = $scope.rolesddd[0];
        }

        //define keyboard listening event
        $scope.myKeyup = function(e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                $scope.showUserGuide();
            }
        };

        /**
         * time_out_func
         */
        $scope.time_out_func = function(time){
            if(time == null){
                $scope.loginParam.button_clicked = false;
                return;
            }
            $timeout(function() {
               $scope.loginParam.button_clicked = false;
            }, time);
        };

        //the login interface ,according to returning msg to guide user operation
        $scope.showUserGuide = function() {
            $scope.loginParam.username = this.selectedRole.name;
            //not null check
            if ($scope.loginParam.username == "" | $scope.loginParam.password == "") {

                var info = $translate.instant("login_log_password_notnull");
                toastr.info(info);
                return;
            }

            //POST request£¬judge the username and password is valid
            var data = {"username": "","password": ""};
            data.username = this.selectedRole.name;
            data.password = hex_md5($scope.loginParam.password).toLowerCase();

            $scope.loginParam.button_clicked = true;
            $http({
                method: 'post',
                url: '/authentication/login',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(res) {
                if (!res.success) { //fail ,notice message
                    var info = $translate.instant(res.msg);
                    toastr.info(info);
                    $scope.time_out_func(3000);
                    return;
                }

                // success msg
                var syncmsgs = res.result.syncmsgs;
                if(syncmsgs != null && syncmsgs.length != 0 ){//show syncmsgs
                    $scope.showSyncmsgs(syncmsgs,res);
                }else{
                    $scope.delayedJumb(res);
                }

            }).error(function(res) {
                toastr.info('login error !');
                $scope.time_out_func(3000);
            });

        };

        $scope.showSyncmsgs = function(syncmsgs,res){


          

            var successMsg = $translate.instant('log_apNumber_success') +":";
            var successNum = 0,faultNum = 0;    
            var faultMsg = "<p>"+$translate.instant('login_log_ap_fault') +":</p>";
            angular.forEach(syncmsgs, function(data,index) {
                if (data != null && data != 'null' && data.success) {
                    successNum ++;
                } else {
                    faultNum ++;
                    faultMsg = faultMsg + "<p>IP:" + index + "</p>";
                }
            });
            successMsg = "<p>" + successMsg + successNum + '</p>';
            var title = $translate.instant('login_log_session_synch_results');
            var info = successMsg;
            if(faultNum > 0){
                info = successMsg + faultMsg + '<p>'+ $translate.instant('login_log_session_synch_error_msg') +'</p>';
            }
            toastr.info(info, title);

            //delayed jump
            $timeout(function() {
                $scope.delayedJumb(res);
            }, 5000);
        };

        /**
         * [delayedJumb description]
         */
        $scope.delayedJumb = function(res){
            console.warn(res);
            $scope.time_out_func();
            //login success ,save the params of page
            window.localStorage.sessionId = res.result.sessionId;
            //according to the result , need wizard config
            if (res.result.flag == 1) { //  flag= 0/1 main/wizard
                window.localStorage.countryCode = res.result.countryFlag;
                //show country code according to return result
                if(res.result.countryFlag=="RW"){//show country code
                    wizardService.setCountryFlag(true);
                }
                wizardService.setUsername($scope.loginParam.username);
                var instance = $modal.open({
                    templateUrl: 'guide-welcome.html',
                    controller: "welcomeCtrl",
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false
                });
                return;
            }

            //jump to main.html
            window.localStorage.username = $scope.loginParam.username;
            window.location.href = "main.html"
        };

    }]);