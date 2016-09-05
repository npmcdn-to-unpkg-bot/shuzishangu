<?php

/**
*tools
*{"HanletName":"WebView for OmniAccess AP","CompanyName":"HAN NETWORKS","SN":"11111114","DeviceModel":"AP101","MAC:34:E7:0B:CC:CC":"40","Country":"US","SoftwareName":"hap","SoftwareVersion":"2.1.0","HardwareVersion":"1.10","EssidPrefix":"cluster","ClusterDescribe":"HAP cluster","Website":"website not exist","Legal":"legal not exist"}
**/
$app->get(
    '/other/systemInfo',
    function (){
		$result = array();
		try {


			$cmd = "showsysinfo;";
			exec($cmd,$execOut);
			foreach($execOut as $v){
				$str = trim($v);//like this => Company Name:HAN NETWORKS
				$key = substr($str,0,strpos($str,':'));
				$vaule = substr($str,strpos($str,':')+1);		
				$result[str_replace(' ',"", $key)] = $vaule;
			}

			unset($execOut);
			$cmd = "uci get system.@system[0].hanletName;showver;cluster-cfg get wireless.wifi0.country;";
			exec($cmd,$execOut);
			$arraySize = count($execOut);
			$result['countryCode'] = $arraySize >=3?$execOut[2]:'';
			$result['SoftwareVer'] = $arraySize >=2?$execOut[1]:'';
			$result['HanletName'] = $arraySize >=1?$execOut[0]:'';

			$response = array(
						'success' => true,
						'result' => $result);	
			echo json_encode($response);		

        } catch(Exception $e) {
			$response = array(
				'success' => false,
				'msg' => 'showsysinfo fault!');	
			echo json_encode($response);
        }
    }
);

/**
 *tools
 */
$app->post(
    '/other/tools',
    function () use ($app) {
		
		try {
			$requestBody = $app->request()->getBody();		
			$obj = json_decode($requestBody);
			$command = $obj->command;
			$hostname = $obj->hostname;

			$cmd = 'tech_support_command '.$command;
			if($hostname != ''){
				$cmd = $cmd.' '.$hostname;
			}

			exec($cmd,$execOut);

			if($execOut == null ){
				$response = array(
							'success' => false,
							'result' => '');	
				echo json_encode($response);
				return;
			}

			$result ='';
			foreach ($execOut as $value) {
				$result = $result.$value."\r\n";
			}

			$response = array(
						'success' => true,
						'result' => $result);	
			echo json_encode($response);

		} catch(Exception $e) {
			$response = array(
							'success' => false,
							'result' => '');	
			echo json_encode($response);
		}

    }
);

$app->get(
    '/other/countryCode',
    function (){
		try {
			$countryFlag = getCountryFlag();
			$response = array(
				'success' => true,
				'countryFlag' => $countryFlag);	
			echo json_encode($response);

        } catch(Exception $e) {
			$error = array(
				'success' => false,
				'msg' => 'get countryCode fault!');	
			echo json_encode($error);
        }
    }
);

?>