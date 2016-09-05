<?php

/**
*get ntpClient confParams
**/
$app->get(
    '/network/ntpClient/confParams',
    function () {
		try {
			$cmd = $cmd."cluster-cfg get system.ntp.server;";
			$cmd = $cmd."date '+%Y-%m-%d %H:%M:%S';";
			$cmd = $cmd."cluster-cfg get system.sysinfo.city;";
			exec($cmd,$execOut);
			
			$ntpServerList = array_merge(array_unique(explode(" ", $execOut[0]))); 

			$response = array(
					'success' => true,
					'result' =>array(
									'timeZone' => "",
									'dateTime' => $execOut[1],
									'ntpServerList' => $ntpServerList,
									'city' => $execOut[2],)
					);
			echo json_encode($response);
		} catch(Exception $e) {
			$error = array(
					'success' => false,
					'msg'=>$e->getMessage());
			echo json_encode($error);
		}	
    }
);

/**
*update NTP server list order
**/
$app->put(
    '/network/ntpClient/ntpserver',
    function () use ($app){
		try {
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$ntpServerList = $obj->ntpServerList;
			
			if(!is_array($ntpServerList)
				|| (count($ntpServerList)== 0)){
				$error = array(
							'success' => false, 
							'msg' => 'lack ntp server ip!');
				echo json_encode($response);				
				return;
			}
			
			//The first clear list ,The second add new list
			$cmd = 'cluster-cfg delete system.ntp.server;';
			foreach($ntpServerList as $v){
				$cmd = $cmd.'cluster-cfg add_list system.ntp.server='.$v.';';
			}
			
			exec($cmd,$execOut);

			$reload = '/etc/init.d/sysntpd reload > /dev/null &';
			exec($reload);	
			$response = array(
						'success' => true, 
						'msg' => '');
			echo json_encode($response);	
			
			$log_info = 'Modify ntp list order success';
			exec("logger -t web -p 5 ".$log_info);				

		} catch(Exception $e) {
			$error = array(
					'success' => false,
					'msg' => $e->getMessage() );
			echo json_encode($error);

			$log_info = 'Modify ntp list order fault:'.$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);		
		}			 
    }
);

/**
*add NTP server
**/
$app->post(
    '/network/ntpClient/ntpserver',
    function () use ($app){
		try {
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$ntpserver = $obj->ntpserver;
					
			if(trim($ntpserver) == ''){
				$error = array(
							'success' => false, 
							'msg' => 'param is null !');
				echo json_encode($error);				
				return;
			}
			
			$cmd = 'cluster-cfg add_list system.ntp.server='.$ntpserver.';';	
			exec($cmd,$execOut);

			$reload = '/etc/init.d/sysntpd reload > /dev/null &';
			exec($reload);	
			$response = array(
						'success' => true, 
						'msg' => '');
			echo json_encode($response);	

			$log_info = 'add ntp server success';
			exec("logger -t web -p 5 ".$log_info);	

		} catch(Exception $e) {
			$error = array(
					'success' => false,
					'msg' => $e->getMessage() );
			echo json_encode($error);
			
			$log_info = 'add ntp server fault:'.$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);					
		}			 
    }
);

/**
*del NTPserver
**/
$app->delete(
    '/network/ntpClient/ntpserver/:ntpserver',
    function ($ntpserver){	
		try {
			$ntpserverAddress = $ntpserver;
			if($ntpserverAddress == ''){
				$error = array(
							'success' => false, 
							'msg' => 'param is null !');
				echo json_encode($error);				
				return;
			}

			$cmd = 'cluster-cfg del_list system.ntp.server='.$ntpserverAddress.';';
			exec($cmd,$execOut);
			$reload = '/etc/init.d/sysntpd reload > /dev/null &';
			exec($reload);	
			$response = array(
						'success' => true, 
						'msg' => '');
			echo json_encode($response);	

			$log_info = 'delete ntp server success';
			exec("logger -t web -p 5 ".$log_info);	

		} catch(Exception $e) {
			$error = array(
					'success' => false,
					'msg' => $e->getMessage() );
			echo json_encode($error);
			
			$log_info = 'delete ntp server fault:'.$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);		
		}			   
    }
);

/**
*modify datetime
**/
$app->put(
    '/network/ntpClient/datetime',
    function () use ($app){
		try {
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$datetime = $obj->datetime;
			
			//modify 
			$cmd = "date -s '".$datetime."' ;";
			exec($cmd,$execOut,$return);
			if($return != 0){

				$response = array(
							'success' => false, 
							'msg' => 'Modify ap datetime fault!');
				echo json_encode($response);	
				return;
			}

			$response = array(
						'success' => true, 
						'msg' => '');
			echo json_encode($response);	
			
			$log_info = 'Modify ap datetime success';
			exec("logger -t web -p 5 ".$log_info);				

		} catch(Exception $e) {
			$error = array(
					'success' => false,
					'msg' => $e->getMessage() );
			echo json_encode($error);

			$log_info = 'Modify ap datetime fault:'.$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);		
		}			 
    }
);

/**
*modify datetime
**/
$app->put(
    '/network/ntpClient/timezone',
    function () use ($app){
		try {
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$timezone = $obj->timezone;
			$city = $obj->city;
			$cmd = 'cluster-cfg set system.sysinfo.timezone='.$timezone.';';
			$cmd = $cmd.'cluster-cfg set system.sysinfo.city='.$city.';';	
			exec($cmd,$execOut,$return);		

			$reload = '/etc/init.d/system reload  > /dev/null &';
			exec($reload);

			$response = array(
						'success' => true, 
						'msg' => '');
			echo json_encode($response);	
			
			$log_info = 'Modify ap timezone success';
			exec("logger -t web -p 5 ".$log_info);				

		} catch(Exception $e) {
			$error = array(
					'success' => false,
					'msg' => $e->getMessage() );
			echo json_encode($error);

			$log_info = 'Modify ap timezone fault:'.$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);		
		}			 
    }
);

?>