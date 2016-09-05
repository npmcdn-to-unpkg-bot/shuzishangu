var myApp = angular.module('myapp',[])
.factory('authentifiedRequest',['$http', function($http) {
		/**http**/
		var httpRequest = function(method, url, params, data, timeout, successCallback, errorCallback) {
			$http({
					method: method,
					url: url,
					params: params,
					data: data,
					timeout: timeout,
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'sessionName ' + window.localStorage.sessionId
					}
				}).success(successCallback).error(errorCallback);
		};

		return {
			get: function(url, params, successCallback, errorCallback) {
				httpRequest('get', url, params, null, 15000, successCallback, errorCallback);
			},
			put: function(url, params, data, successCallback, errorCallback) {
				httpRequest('put', url, params, data, 15000, successCallback, errorCallback);
			},
			post: function(url, params, data, successCallback, errorCallback) {
				httpRequest('post', url, params, data, 15000, successCallback, errorCallback);
			},
			delete: function(url, params, successCallback, errorCallback) {
				httpRequest('delete', url, params, data, 15000, successCallback, errorCallback);
			},
			request: httpRequest
		}
	}])


	angular.module('phonecatServices',[ngResource])
	.factory('phone',function($resource){
		return $resource('phones/:phoneId.json',{},{
			query:{method:'GET',params:{phoneId:'phones'},isArray:true}
		});
	});













