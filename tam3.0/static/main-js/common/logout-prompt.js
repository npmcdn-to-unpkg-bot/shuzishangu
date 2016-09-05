angular.module('main')
	.controller("logoutPromptCtrl", ['$scope', '$timeout', '$modalInstance', 'authentifiedRequest', 'flag', function($scope, $timeout, $modalInstance, authentifiedRequest, flag) {
		$scope.flag = flag; //  1:nosessionId 2:different sessionId 3:sessionId timeout
		$scope.timeout;
		var logoutSecond = 15; //15s
		var timer;
		$scope.initFunction = function() {
			//tips for timer
			if (flag == 3) {
				logoutSecond = 15;
				timer = setInterval($scope.changeLogout_15s_text, 1000);
			}else{
				timer = setInterval($scope.changeLogout_5s_text, 1000);
				logoutSecond = 5;
			}

			//quit until time over
			$scope.timeout = $timeout(function() {
				$scope.logout();
			}, logoutSecond * 1000);
		};

		/**
		 * 15min no operate, 15s tips for timer
		 */
		$scope.changeLogout_15s_text = function() {
			var logout_15s = $("#logout-15s");
			if(logoutSecond != 0){
				logoutSecond = logoutSecond - 1;
			}
			var tmp = "Your login session is about to expire due to inactivity in " + logoutSecond + " seconds.";
			logout_15s.text(tmp);
		};

		/**
		 * 5s tips before be kickoff
		 */
		$scope.changeLogout_5s_text = function() {
			var logout_5s = $("#logout-5s");
			if(logoutSecond != 0){
				logoutSecond = logoutSecond - 1;
			}
			var tmp = "Your account has logged in elsewhere,  and this visit will end in " + logoutSecond + " seconds.";
			logout_5s.text(tmp);
		};


		/**
		 * cancel logout,send keep alive msg
		 */
		$scope.unlogout = function() {
			//clear timer
			$timeout.cancel($scope.timeout);
			clearInterval(timer);

			authentifiedRequest.post('/authentication/unlogout', null, null, function(data) {
				$modalInstance.dismiss('cancel');
			});
		};

		/**
		 * logout
		 */
		$scope.logout = function() {
			//clear timer
			$timeout.cancel($scope.timeout);
			clearInterval(timer);
			window.location.href = "/static/login.html";
		};

		$scope.initFunction();

	}]);