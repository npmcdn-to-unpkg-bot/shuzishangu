<?php

/**
 * use uci savesessionId
 * @param  $username  
 * @param  $sessionId 
 * @param  $flag    0/1:public/private
 * @return  boolean
 **/
function saveSessionId($username,$sessionId,$flag){

	
	if($flag == 1){//private,use uci
		$cmd = 'uci set system.'.$username.'.sessionId='.$sessionId.';uci commit;';
		exec($cmd,$execOut,$return_var);
	}else{//public
		$cmd = 'cluster-cfg set system.'.$username.'.sessionId='.$sessionId.';';
		exec($cmd,$execOut,$return_var);
		$reload = '/etc/init.d/system reload > /dev/null &';
		exec($reload);		
	}
	
	if($return_var !== 0){
		return false;
	}
	saveSessionIdValidity($username);
	return true;
}

/***
*sync sessionId
**/
function syncSessionId($username,$sessionId,$flag){
	$url_array = array();
	//return $url_array;
	$apList = aplist();
	if($apList == null || $apList == -1){
		$log_info = ' syncSessionId fault:apList is null';
		exec("logger -t web -p 6 ".$log_info);	
		return $url_array;
	}

	$startWith ='http://';
	$webServerPort ='8080';		
	foreach ($apList as $v){
		$str = "mac:".$v['mac']."state:".$v['state']."\n";
		if($v['state'] == '3' || $v['state'] == '2'){//working/Initializing ap
			$apip = $v['ip'];
			$url= $startWith.$apip.':'.$webServerPort.'/authentication/syncSessionId';
			$ap_obj = array();
			$ap_obj['ip'] = $apip;
			$ap_obj['url'] = $url;
			array_push($url_array,$ap_obj);
		}
	}

	if(count($url_array) == 0 ){
		return $url_array;
	}

    $commonFunction = new CommonFunction();
	$data = array(
				'username' => $username,
				'sessionId' => $sessionId,
				'flag' => $flag
				);

	$syncContents = $commonFunction->postMultiExec($url_array,$data);

	return $syncContents;

}

/**
 * getCountryFlag
 */
function getCountryFlag(){

	$cmd = "showsysinfo";
	exec($cmd,$execOut);
	$result = array();

	foreach($execOut as $v){
		$str = trim($v);//like this => Company Name:HAN NETWORKS
		$key = substr($str,0,strpos($str,':'));
		$vaule = substr($str,strpos($str,':')+1);		
		$result[str_replace(' ',"", $key)] = $vaule;
	}
	$countryFlag = $result['Country'];	
	return $countryFlag;
}

/**
 * [checkErrorNum description]
 */
function checkErrorNum($username,$tries){
	$errorNum = 0;
	$cmd = 'uci get system.'.$username.'.errorNum;uci get system.'.$username.'.errorTime;';
	exec($cmd,$execOut,$return_var);
	if($return_var != 0){//first login
		return 0;
	}

	$errorNum = $execOut[0];
	if($errorNum < $tries){
		return $errorNum;
	}

	//$errorNum =3,check  errorTime
	$errorTime = $execOut[1];
	$now = time();	
	if($now > $errorTime){
		clearErrorNum($username);
		return 0;
	}

	return $tries;
}

/**
 * [clearErrorNum description]
 */
function clearErrorNum($username){
	$cmd = 'uci set system.'.$username.'.errorNum=0;uci set system.'.$username.'.errorTime=0;uci commit;';
	exec($cmd,$execOut,$return_var);
}

/**
 * [setErrorNum description]
 */
function setErrorNum($username,$errorNum){
	$cmd = 'uci set system.'.$username.'.errorNum='.$errorNum.';';
	if($errorNum == 3){
		$errorTime = time() + 1*60;
		$cmd = $cmd.'uci set system.'.$username.'.errorTime='.$errorTime.';';
	}else{
		$cmd = $cmd.'uci set system.'.$username.'.errorTime=0;';
	}
	$cmd = $cmd.'uci commit;';
	exec($cmd);
}

/**
*login
**/
$app->post(
    '/authentication/login',
    function () use ($app) {
		try {
		
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$username = $obj->username;
			$password = $obj->password;

			/**1 check errorNum**/
			$tries = 3;//attempt times
			$errorNum = checkErrorNum($username,$tries);

			if($errorNum == 3){
				$response = array(
				'success' => false, 
				'msg' => 'login_log_account_lock');//login_log_account_lock =>The password for the three time, account for 1 minutes!				
				echo json_encode($response);
				return;
			}

			/**2 check password**/
			$cmd = 'cluster-cfg get system.'.$username.'.password;';
			exec($cmd,$execOut,$return_var);
			if($return_var !== 0
			 || $password !== $execOut[0]){//password error
			 	$errorNum = $errorNum +1;
				$msg = '';
			 	if($errorNum < 3){
					$msg = 'login_log_Password_error'.$errorNum;
			 	}else{
			 		$msg = 'login_log_account_lock';
			 	}

			 	$error = array(
				'success' => false, 
				'msg' => $msg);
				echo json_encode($error);
				//set errornum
				setErrorNum($username,$errorNum);
				return;
			}

			//password check success clearErrorNum
			if($errorNum != 0){
				clearErrorNum($username);
			}
			
			/**
			* admin need wizard
			**/
			$flag = 0;//(0:main page ;1:wizard page)
			$country_flag = '';
			if($username =='Administrator'){
				unset($execOut);
				$cmd = "getrevnumber;";
				exec($cmd,$execOut,$return_var);
				if($return_var == 0 && $execOut[0] == 0){
					//check lock state
					unset($execOut);
					$cmd = "cfglock_stat;";
					exec($cmd,$execOut,$return_var);
					if($execOut[0]== 'unlocked'){
						$flag = 1;
						/**get countryFlag */
						$country_flag = getCountryFlag();
					}
				}				
			}else{//viewer  GuestOperator 
				unset($execOut);
				$cmd = 'cluster-cfg get system.'.$username.'.enable;';
				exec($cmd,$execOut);
				if(1 != $execOut[0]){//enable == 0
				 	$error = array(
					'success' => false, 
					'msg' => 'login_log_account_banned');
					echo json_encode($error);
					return;
				}	
			}		
					
			/**3 create and save sessionId**/
			$sessionId = md5(time() . mt_rand(0,1000));	
			if(!saveSessionId($username,$sessionId,$flag)){
				$error = array(
					'success' => false, 
					'msg' => 'login_log_saveSessionid_error');
				echo json_encode($error);
				return;
			}
			
			/**4 sync sessionId**/
			$syncret = syncSessionId($username,$sessionId,$flag );


			/*5 return success*/
	        $response = array(
						'success' => true,
						'result' =>array(
								'sessionId' => $sessionId,
								'flag' => $flag,
								'countryFlag' => $country_flag,
								'syncmsgs' => $syncret)					
						);
	        echo json_encode($response);

			$log_info = $username.' login success';
			exec("logger -t web -p 6 ".$log_info);			        

		} catch(Exception $e) {
	        $error = array(
						'success' => false,
						'msg' =>$e->getMessage());
	        echo json_encode($error);

			$log_info = ' login fault:'.$e->getMessage();
			exec("logger -t web -p 6 ".$log_info);				        
		}	

    }
);

/**
*update sessionId
**/
$app->post(
    '/authentication/syncSessionId',
    function () use ($app) {
    	try {
	    	/**1 get param**/
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$username = $obj->username;
			$sessionId = $obj->sessionId;	
			$flag = $obj->flag;	

			//2 save session
			if(!saveSessionId($username,$sessionId,$flag)){
				$error = array(
				'success' => false, 
				'msg' => 'save sessionId error!');
				echo json_encode($error);
				return;
			}
			
			/*3 return success*/
	        $response = array(
						'success' => true,
						'msg' => 'save sessionId success!'				
						);
	        echo json_encode($response);
    	} catch(Exception $e) {
	        $error = array(
						'success' => false,
						'msg' =>$e->getMessage());
	        echo json_encode($error);

			$log_info = ' syncSessionId:'.$e->getMessage();
			exec("logger -t web -p 6 ".$log_info);				        
		}
    }
);

/**
*check sessionStatus
**/
$app->post(
    '/authentication/sessionStatus',
    function () use ($app) {
		$isLogin = validateIsLogin($app->request,FALSE);
		if(FALSE == $isLogin){
			$app->halt(403, 'session or invalid, please re-login!');
			return;
		}

        $response = array(
					'success' => true,
					'msg' => 'sessionId status is ok!'				
					);
        echo json_encode($response);
    }
);

?>