angular.module('login')
	.controller("login-logoutPromptCtrl", ['$scope', '$timeout', '$modalInstance', function($scope, $timeout, $modalInstance) {
		$scope.timeout;
		var logoutSecond = 5; //15s
		var timer;
		$scope.flag = 2;
		$scope.initFunction = function() {
			//tips for timer
			timer = setInterval($scope.changeLogout_5s_text, 1000);

			//quit until time over
			$scope.timeout = $timeout(function() {
				$scope.logout();
			}, logoutSecond * 1000);
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