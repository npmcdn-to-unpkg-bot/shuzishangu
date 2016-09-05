<?php

/**
*wizard
**/
$app->post(
    '/other/wizard',
    function () use ($app){
    	try {
	    	$requestBody = $app->request()->getBody();		
			$requestParas = json_decode($requestBody);
			$username = $requestParas->username;
			$passwd = $requestParas->password;
			$countryCode = $requestParas->countryCode;
			$timezone = $requestParas->timezone;
			$city = $requestParas->city;
					
			//check
			if($passwd == null || $passwd ==''){
				$response = array(
							'success' => false,
							'msg' => 'Paramater is invalid!');	
				echo json_encode($response);
				return;
			}

			$cmd = "getrevnumber;";
			exec($cmd,$execOut_1,$return_var);
			if($return_var != 0 || $execOut_1[0] != 0){
				$response = array(
							'success' => false,
							'msg' => 'wizard_log_wizardCancelled');	
				echo json_encode($response);
				return;
			}
					
			//get lock
			$cmd = "cfglock;";
			exec($cmd,$execOut_2,$return_var);
			if($return_var != 0 || $execOut_2[0] != 'locked'){
				$response = array(
					'success' => false,
					'msg' => 'wizard_log_wizardAutomated');	
				echo json_encode($response);
				return;
			}

			//set password
			$cmd = 'cluster-cfg set system.'.$username.'.password='.$passwd.';';
			exec($cmd,$execOut_3);

			$log_info = 'wizard set Administrator password success';
			exec("logger -t web -p 5 \"".$log_info."\"");			

			//set country code
			if($countryCode != ''){
				$setcountry = 'config_wlan setcountry '.$countryCode.' /dev/null &';
				exec($setcountry);		
				exec("logger -t web -p 7 \"".$setcountry."\"");
				$log_info = 'wizard set country : '.$countryCode.' success';
				exec("logger -t web -p 5 \"".$log_info."\"");
			}


			//set timeZone
			$cmd = 'cluster-cfg set system.sysinfo.timezone='.$timezone.';';
			$cmd = $cmd.'cluster-cfg set system.sysinfo.city='.$city.';';	
			exec($cmd);		

			$reload = '/etc/init.d/system reload  > /dev/null &';
			exec($reload);

			exec("logger -t web -p 7 \"".$cmd."\"");
			$log_info = 'wizard set timezone : '.$timezone.', city : '.$city.' success';
			exec("logger -t web -p 5 \"".$log_info."\"");

			//add wlan
			$msg = "wizard success";
			$success = true;
			$return = addWlan($requestParas);
			if($return != 0 ){
				$success = false;
				$msg = "wizard_log_addWlan_fault";
			}
		
			//unlock
			exec("cfgunlock;");
					
			$response = array(
						'success' => $success,
						'msg' => $msg);				
			echo json_encode($response);	


			$log_info = 'wizard config finish - '.$response.msg;
			if($response.success){
				exec("logger -t web -p 5 \"".$log_info."\"");		
	        }else{
	        	exec("logger -t web -p 3 \"".$log_info."\"");		
	        }

        } catch(Exception $e) {
        	//unlock
			exec("cfgunlock;");

			$response = array(
						'success' => false,
						'msg' => $e->getMessage() );
			echo json_encode($response);
			$log_info = 'wizard error:'.$e->getMessage();
			exec("logger -t web -p 3 \"".$log_info."\"");		
        }	
    }
);

?>