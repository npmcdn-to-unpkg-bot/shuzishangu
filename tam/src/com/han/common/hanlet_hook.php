<?php
 
/**
*  check sessionId befor route
**/
$app->hook('slim.before.dispatch', function() use ($app) {
	//safed Routes
	$securedRoutes = array("/","/authentication/login","/logout","/authentication/syncSessionId","/authentication/sessionStatus");

	if (in_array($app->request()->getPathInfo(),$securedRoutes) || $app->request()->isOptions()){
		return;
	}

	$updateTimestamp = true;
	$periodicRoutes = array("/haps","/wlans","/totalclientlist","/monitor/cpuAndMemUsage","/getapname");
	if (in_array($app->request()->getPathInfo(),$periodicRoutes)){
		$updateTimestamp = FALSE;
	}

	$isLogin = validateIsLogin($app->request,$updateTimestamp);
	if(FALSE == $isLogin){
		$app->halt(203, 'session or invalid, Does not respond to the operation!');
	}
 });

 /**
*validateIsLogin and reSaveSessionIdValidity
**/
function validateIsLogin($request,$updateTimestamp){
	try {
		$authorization = $request->headers->get('Authorization');	
		$key = 'sessionName ';//Authorization
		if(0 == strncmp($authorization, $key, strlen($key))){
			$sessionId = substr($authorization, strlen($key));
			
			if(!$sessionId){
				return FALSE;
			}	
			//check sessionId (must use UCI !!!!	)
			$users = array('Administrator', 'Viewer','GuestOperator');

			$isValidity = FALSE;
			$now = time();
  			foreach ($users as $user) {
  				unset($execOut);
  				$cmd = "uci get system.".$user.".sessionId;uci get system.".$user.".sessionValidity;";
  				exec($cmd,$execOut,$reval);
				if($return_var == 0 && $execOut[0] == $sessionId){//sessionId  isExist
					$sessionValidityInt =  intval($execOut[1]);
					if($now < $sessionValidityInt){//sessionId is validity
						$isValidity = true;
						if($updateTimestamp){//need updateTimestamp
							saveSessionIdValidity($user);
						}
					}
					break;
				}
  			}

			return $isValidity;
		}else{
			return FALSE;
		}	

	} catch(Exception $e) {
		return FALSE;
	}	

};

/**
 * use uci savesessionIdValidity
 * @param  $username  
 **/
function saveSessionIdValidity($username){
	$now = time();
	$sessionValidity = 60*30;
	$sessionValidityPeriod = $now + $sessionValidity;
	
	$cmd = $cmd.'uci set system.'.$username.'.sessionValidity='.$sessionValidityPeriod.';';
	$cmd = $cmd.'uci commit;';
	exec($cmd);
}

?>