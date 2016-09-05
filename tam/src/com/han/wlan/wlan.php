<?php

function ssidEscape($ssid){
	$escape = "\"";

	$ssid = str_replace("%2B", "+", $ssid);
	$ssid = str_replace("%2F", "/", $ssid);
	$ssid = str_replace("%3F", "?", $ssid);
	$ssid = str_replace("`", "\`", $ssid);
	$ssid = str_replace('"', '\"', $ssid);

	$ssid = $escape.$ssid.$escape;

	return $ssid;
}

function secretEscape($secret){
	$escape = "\"";

	$secret = str_replace('"', '\"', $secret);

	$secret = $escape.$secret.$escape;

	return $secret;
}

function countWlanNum(){
	$cmd_wlanList = "config_wlan list_wlan";
	exec($cmd_wlanList, $lines_wlanList, $return_wlanList);
	//var_dump($lines_wlanList);

	$twoGNum = 0;
	$fiveGNum = 0;
	if(0 === $return_wlanList){
		foreach ($lines_wlanList as $linenum => $line) {
			$pos = strpos($line, "frequence=");
			if(FALSE === $pos){
				continue;
			}

			$pos = strpos($line, "=");
			if(FALSE === $pos){
				continue;
			}

			$frequence = substr($line, $pos+1);
			if(0 == strcmp("2G,5G", $frequence)){
				$twoGNum++;
                $fiveGNum++;
			}else if(0 == strcmp("2G", $frequence)){
				$twoGNum++;
			}else if(0 == strcmp("5G", $frequence)){
				$fiveGNum++;
			}
		}
	}

	$result = array(
				'twoGNum' => $twoGNum,
				'fiveGNum' => $fiveGNum);

	return $result;
}

/*
	return 0: success
	return -1: fail
	return -2: twoGNum and fiveGNum is more than 7
	return -3: twoGNum is more than 7
	return -4: fiveGNum is more than 7
*/
function addWlan($requestParas){
	$ssid = ssidEscape($requestParas->ssid);
	$band = $requestParas->band;
	$securityType = $requestParas->securityType;

	$result = countWlanNum();
	$twoGNum = $result[twoGNum];
	$fiveGNum = $result[fiveGNum];
	//echo "2gNum:".$twoGNum." 5gNum:".$fiveGNum;

	$returnValue = -1;
	if((7 === $twoGNum) && (7 === $fiveGNum)){
		$returnValue = -2;
	}else if(7 === $twoGNum){
		$returnValue = -3;
	}else if(7 === $fiveGNum){
		$returnValue = -4;
	}

	$crypto = new Crypto();
	if("2G,5G" === $band){
		if(-1 !== $returnValue){
			return $returnValue;
		}

		if(0 == strcmp($securityType, "Open")){
			$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 noflush > /dev/null 2>&1 & config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 > /dev/null 2>&1 &";
		}else if(0 == strcmp($securityType, "Personal")){
			$encryption = $requestParas->encryption;
            $key = secretEscape($crypto->decode($requestParas->key));

            $cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 encryption ".$encryption." key ".$key." noflush > /dev/null 2>&1 & config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 encryption ".$encryption." key ".$key." > /dev/null 2>&1 &";
		}else if(0 == strcmp($securityType, "Enterprise")){
			$encryption = $requestParas->encryption;
			$authServer = $requestParas->authServer;
			$authPort = $requestParas->authPort;
			$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
			$acctServer = $requestParas->acctServer;
			$acctPort = $requestParas->acctPort;
			$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));

			$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." noflush > /dev/null 2>&1 & config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." > /dev/null 2>&1 &";
		}
	}else if("2G" === $band){
		if((-2 === $returnValue) || (-3 === $returnValue)){
			return $returnValue;
		}

		if(0 == strcmp($securityType, "Open")){
			$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 > /dev/null 2>&1 &";
		}else if(0 == strcmp($securityType, "Personal")){
			$encryption = $requestParas->encryption;
            $key = secretEscape($crypto->decode($requestParas->key));

            $cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 encryption ".$encryption." key ".$key." > /dev/null 2>&1 &";
		}else if(0 == strcmp($securityType, "Enterprise")){
			$encryption = $requestParas->encryption;
			$authServer = $requestParas->authServer;
			$authPort = $requestParas->authPort;
			$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
			$acctServer = $requestParas->acctServer;
			$acctPort = $requestParas->acctPort;
			$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));

			$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." > /dev/null 2>&1 &";
		}
	}else{
		if((-2 === $returnValue) || (-4 === $returnValue)){
			return $returnValue;
		}

		if(0 == strcmp($securityType, "Open")){
			$cmd = "config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 > /dev/null 2>&1 &";
		}else if(0 == strcmp($securityType, "Personal")){
			$encryption = $requestParas->encryption;
            $key = secretEscape($crypto->decode($requestParas->key));

            $cmd = "config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 encryption ".$encryption." key ".$key." > /dev/null 2>&1 &";
		}else if(0 == strcmp($securityType, "Enterprise")){
			$encryption = $requestParas->encryption;
			$authServer = $requestParas->authServer;
			$authPort = $requestParas->authPort;
			$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
			$acctServer = $requestParas->acctServer;
			$acctPort = $requestParas->acctPort;
			$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));

			$cmd = "config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." > /dev/null 2>&1 &";
		}
	}

	//echo "cmd:".$cmd;
	exec($cmd, $output, $return);

	$pos = strpos($ssid, "'");
	if(0 === $return){
        if(FALSE !== $pos){
        	$log_info = "\"".$cmd." result:success\"";
        }else{
        	$log_info = "'".$cmd." result:success'";
        }
		exec("logger -t web -p 5 ".$log_info);

		return 0;
	}else{
		if(FALSE !== $pos){
			$log_info = "\"".$cmd." result:fail\"";
		}else{
			$log_info = "'".$cmd." result:fail'";
		}
		exec("logger -t web -p 5 ".$log_info);

		return -1;
	}
}

/**
*	add wlan
**/
$app->post(
    '/wlan',
    function () use ($app){
    	try{
    		$requestBody = $app->request()->getBody();
			$requestParas = json_decode($requestBody);

			$return = addWlan($requestParas);

			$captivePortal = $requestParas->captivePortal;
			if(0 == strcmp($captivePortal, "Yes")){
				$ssid = ssidEscape($requestParas->ssid);
				$cmd = "eag_uci add ".$ssid;
				//echo "cmd:".$cmd;
				exec($cmd, $output, $return_eag);
				sleep(3);
				$return_restart = reload_eag_config();
				if((0 === $return_eag) && ($return_restart)){
					if(FALSE !== $pos){
						$log_info = "\"".$cmd." result:success\"";
					}else{
						$log_info = "'".$cmd." result:success'";
					}
				}else{
					if(FALSE !== $pos){
						$log_info = "\"".$cmd." result:fail\"";
					}else{
						$log_info = "'".$cmd." result:fail'";
					}
				}
				exec("logger -t web -p 5 ".$log_info);
			}

			if(0 === $return){
				$response = array(
							'success' => true,
							'msg' => 'wlan_add_success');
			}else if(-1 === $return){
				$response = array(
							'success' => false,
							'msg' => 'wlan_add_fail');
			}else if(-2 === $return){
				$response = array(
							'success' => false,
							'msg' => 'wlan_add_error_1');

				$log_info = "add wlan: twoGNum and fiveGNum is more than 7!";
			}else if(-3 === $return){
				$response = array(
							'success' => false,
							'msg' => 'wlan_add_error_2');

				$log_info = "add wlan: twoGNum is more than 7!";
			}else if(-4 === $return){
				$response = array(
							'success' => false,
							'msg' => 'wlan_add_error_3');

				$log_info = "add wlan: fiveGNum is more than 7!";
			}

			echo json_encode($response);

			exec("logger -t web -p 5 ".$log_info);
    	}catch(Exception $e){
			$response = array(
						'success' => false,
						'msg' => $e->getMessage());
			echo json_encode($response);

			$log_info = "add wlan: ".$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);
		}
	}
);

/**
*	add advance wlan
**/
$app->post(
    '/advanceWlan',
    function () use ($app){
    	try{
    		$requestBody = $app->request()->getBody();
			$requestParas = json_decode($requestBody);
			$ssid = ssidEscape($requestParas->ssid);
			$band = $requestParas->band;
			if("Yes" === $requestParas->hidden){
				$hidden = 1;
			}else{
				$hidden = 0;
			}

			if("No" === $requestParas->enable){
				$enable = 0;
			}else{
				$enable = 1;
			}

			$maxClients = $requestParas->maxClients;
			$probeThreshold = $requestParas->probeThreshold;
			$vlanId = $requestParas->vlanId;
			$upstreamLimit = $requestParas->upstreamLimit;
			$downstreamLimit = $requestParas->downstreamLimit;
			$securityType = $requestParas->securityType;

			$result = countWlanNum();
			$twoGNum = $result[twoGNum];
			$fiveGNum = $result[fiveGNum];
			//echo "2gNum:".$twoGNum." 5gNum:".$fiveGNum;

			$returnValue = -1;
			if((7 === $twoGNum) && (7 === $fiveGNum)){
				$returnValue = -2;
			}else if(7 === $twoGNum){
				$returnValue = -3;
			}else if(7 === $fiveGNum){
				$returnValue = -4;
			}

			$crypto = new Crypto();
			if("2G,5G" === $band){
				if(-1 === $returnValue){
					if(0 == strcmp($securityType, "Open")){
						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." noflush > /dev/null 2>&1 & config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." > /dev/null 2>&1 &";
					}else if(0 == strcmp($securityType, "Personal")){
						$encryption = $requestParas->encryption;
						$key = secretEscape($crypto->decode($requestParas->key));
						if($requestParas->fast){
							$fast = 1;
						}else{
							$fast = 0;
						}

						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." key ".$key." ieee80211r ".$fast." noflush > /dev/null 2>&1 & config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." key ".$key." ieee80211r ".$fast." > /dev/null 2>&1 &";
					}else if(0 == strcmp($securityType, "Enterprise")){
						$encryption = $requestParas->encryption;
						$authServer = $requestParas->authServer;
						$authPort = $requestParas->authPort;
						$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
						$acctServer = $requestParas->acctServer;
						$acctPort = $requestParas->acctPort;
						$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));
						if($requestParas->fast){
							$fast = 1;
						}else{
							$fast = 0;
						}
						if($requestParas->okc){
							$okc = 1;
						}else{
							$okc = 0;
						}

						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." ieee80211r ".$fast." okc ".$okc." noflush > /dev/null 2>&1 & config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." ieee80211r ".$fast." okc ".$okc." > /dev/null 2>&1 &";
					}
				}
			}else if("2G" === $band){
				if((-2 !== $returnValue)&&(-3 !== $returnValue)){
					if(0 == strcmp($securityType, "Open")){
						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." > /dev/null 2>&1 &";
					}else if(0 == strcmp($securityType, "Personal")){
						$encryption = $requestParas->encryption;
						$key = secretEscape($crypto->decode($requestParas->key));
						if($requestParas->fast){
							$fast = 1;
						}else{
							$fast = 0;
						}

						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." key ".$key." ieee80211r ".$fast." > /dev/null 2>&1 &";
					}else if(0 == strcmp($securityType, "Enterprise")){
						$encryption = $requestParas->encryption;
						$authServer = $requestParas->authServer;
						$authPort = $requestParas->authPort;
						$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
						$acctServer = $requestParas->acctServer;
						$acctPort = $requestParas->acctPort;
						$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));
						if($requestParas->fast){
							$fast = 1;
						}else{
							$fast = 0;
						}
						if($requestParas->okc){
							$okc = 1;
						}else{
							$okc = 0;
						}

						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 2G device wifi0 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." ieee80211r ".$fast." okc ".$okc." > /dev/null 2>&1 &";
					}
				}
			}else{
				if((-2 !== $returnValue)&&(-4 !== $returnValue)){
					if(0 == strcmp($securityType, "Open")){
						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." > /dev/null 2>&1 &";
					}else if(0 == strcmp($securityType, "Personal")){
						$encryption = $requestParas->encryption;
						$key = secretEscape($crypto->decode($requestParas->key));
						if($requestParas->fast){
							$fast = 1;
						}else{
							$fast = 0;
						}

						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." key ".$key." ieee80211r ".$fast." > /dev/null 2>&1 &";
					}else if(0 == strcmp($securityType, "Enterprise")){
						$encryption = $requestParas->encryption;
						$authServer = $requestParas->authServer;
						$authPort = $requestParas->authPort;
						$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
						$acctServer = $requestParas->acctServer;
						$acctPort = $requestParas->acctPort;
						$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));
						if($requestParas->fast){
							$fast = 1;
						}else{
							$fast = 0;
						}
						if($requestParas->okc){
							$okc = 1;
						}else{
							$okc = 0;
						}

						$cmd = "config_wlan add_wlan ssid ".$ssid." freq 5G device wifi1 hidden ".$hidden." enable ".$enable." maxsta ".$maxClients." probe_threshold ".$probeThreshold." vlan ".$vlanId." upstream_limit ".$upstreamLimit." downstream_limit ".$downstreamLimit." encryption ".$encryption." auth_server ".$authServer." auth_port ".$authPort." auth_secret ".$authSecret." acct_server ".$acctServer." acct_port ".$acctPort." acct_secret ".$acctSecret." ieee80211r ".$fast." okc ".$okc." > /dev/null 2>&1 &";
					}
				}
			}

			if(0 === strcmp("", $cmd)){
				if(-2 === $returnValue){
					$response = array(
								'success' => false,
								'msg' => 'wlan_add_error_1');

					$log_info = "add advanceWlan: twoGNum and fiveGNum is more than 7!";
				}else if(-3 === $returnValue){
					$response = array(
								'success' => false,
								'msg' => 'wlan_add_error_2');

					$log_info = "add advanceWlan: twoGNum is more than 7!";
				}else if(-4 === $returnValue){
					$response = array(
								'success' => false,
								'msg' => 'wlan_add_error_3');

					$log_info = "add advanceWlan: fiveGNum is more than 7!";
				}

				echo json_encode($response);

				exec("logger -t web -p 5 ".$log_info);
			}else{
				//echo "cmd:".$cmd;
				exec($cmd, $output, $return_wlan);

				$pos = strpos($ssid, "'");
				if(0 === $return_wlan){
					if(FALSE !== $pos){
						$log_info = "\"".$cmd." result:success\"";
					}else{
						$log_info = "'".$cmd." result:success'";
					}
				}else{
					if(FALSE !== $pos){
						$log_info = "\"".$cmd." result:fail\"";
					}else{
						$log_info = "'".$cmd." result:fail'";
					}
				}
				exec("logger -t web -p 5 ".$log_info);

				$captivePortal = $requestParas->captivePortal;
				if(0 == strcmp($captivePortal, "Yes")){
					$cmd = "eag_uci add ".$ssid;
					//echo "cmd:".$cmd;
					exec($cmd, $output, $return_eag);
					sleep(3);
					$return_restart = reload_eag_config();
					if((0 === $return_eag) && ($return_restart)){
						if(FALSE !== $pos){
							$log_info = "\"".$cmd." result:success\"";
						}else{
							$log_info = "'".$cmd." result:success'";
						}
					}else{
						if(FALSE !== $pos){
							$log_info = "\"".$cmd." result:fail\"";
						}else{
							$log_info = "'".$cmd." result:fail'";
						}
					}
					exec("logger -t web -p 5 ".$log_info);
				}

				if(0 === $return_wlan){
					$response = array(
								'success' => true,
								'msg' => 'wlan_add_success');
				}else{
					$response = array(
								'success' => false,
								'msg' => 'wlan_add_fail');
				}

				echo json_encode($response);
			}
    	}catch(Exception $e){
			$response = array(
						'success' => false,
						'msg' => $e->getMessage());
			echo json_encode($response);

			$log_info = "add advanceWlan: ".$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);
		}
	}
);

/**
*	delete wlan
**/
$app->delete(
    '/wlan/:ssid',
    function ($ssid){
    	try{
    		$ssid = ssidEscape($ssid);

			$cmd = "eag_uci get ".$ssid;
			$last_line = exec($cmd, $lines, $return);
			if(0 === $return){
				sscanf($last_line, "%d", $captivePortalInt);
				if(1 === $captivePortalInt){	//captivePortal is open
					$cmd = "eag_uci del ".$ssid;
					//echo "cmd:".$cmd;
					exec($cmd, $output, $return_eag);
					sleep(3);
					$return_restart = reload_eag_config();

					$pos = strpos($ssid, "'");
					if((0 === $return_eag) && ($return_restart)){
						if(FALSE !== $pos){
							$log_info = "\"".$cmd." result:success\"";
						}else{
							$log_info = "'".$cmd." result:success'";
						}
					}else{
						if(FALSE !== $pos){
							$log_info = "\"".$cmd." result:fail\"";
						}else{
							$log_info = "'".$cmd." result:fail'";
						}
					}
					exec("logger -t web -p 5 ".$log_info);
				}
			}

			$cmd = "config_wlan del_wlan ssid ".$ssid;
			//echo "cmd:".$cmd;
			exec($cmd, $output, $return_wlan);

			if(0 === $return_wlan){
				$response = array(
							'success' => true,
							'msg' => 'wlan_delete_success');

				if(FALSE !== $pos){
					$log_info = "\"".$cmd." result:success\"";
				}else{
					$log_info = "'".$cmd." result:success'";
				}
			}else{
				$response = array(
							'success' => false,
							'msg' => 'wlan_delete_fail');

				if(FALSE !== $pos){
					$log_info = "\"".$cmd." result:fail\"";
				}else{
					$log_info = "'".$cmd." result:fail'";
				}
			}

			echo json_encode($response);

			exec("logger -t web -p 5 ".$log_info);
    	}catch(Exception $e){
			$response = array(
						'success' => false,
						'msg' => $e->getMessage());
			echo json_encode($response);

			$log_info = "delete wlan: ".$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);
		}
	}
);

/**
*	edit wlan status
**/
$app->put(
    '/wlanStatus/:ssid',
    function ($ssid) use ($app){
    	try{
    		$ssid = ssidEscape($ssid);

			$requestBody = $app->request()->getBody();
			$requestParas = json_decode($requestBody);
			if($requestParas->enable){
				$enable = 1;
			}else{
				$enable = 0;
			}

			$cmd = "config_wlan edit_wlan ssid ".$ssid." enable ".$enable;
			//echo "cmd:".$cmd;
			exec($cmd, $output, $return);

			$pos = strpos($ssid, "'");
			if(0 === $return){
				$response = array(
							'success' => true,
							'msg' => 'wlan_edit_status_success');

				if(FALSE !== $pos){
					$log_info = "\"".$cmd." result:success\"";
				}else{
					$log_info = "'".$cmd." result:success'";
				}
			}else{
				$response = array(
							'success' => false,
							'msg' => 'wlan_edit_status_fail');

				if(FALSE !== $pos){
					$log_info = "\"".$cmd." result:success\"";
				}else{
					$log_info = "'".$cmd." result:success'";
				}
			}

			echo json_encode($response);

			exec("logger -t web -p 5 ".$log_info);
    	}catch(Exception $e){
			$response = array(
						'success' => false,
						'msg' => $e->getMessage());
			echo json_encode($response);

			$log_info = "config wlanStatus: ".$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);
		}
	}
);

/**
*	edit wlan
**/
$app->put(
    '/wlan/:oldssid',
    function ($oldssid) use ($app){
    	try{
    		$oldssid = ssidEscape($oldssid);

			$requestBody = $app->request()->getBody();
			$requestParas = json_decode($requestBody);
			$newssid = ssidEscape($requestParas->ssid);
			if("Yes" === $requestParas->hidden){
				$hidden = 1;
			}else{
				$hidden = 0;
			}

			$enable = $requestParas->enable;
			$maxClients = $requestParas->maxClients;
			$probeThreshold = $requestParas->probeThreshold;
			$vlanId = $requestParas->vlanId;
			$upstreamLimit = $requestParas->upstreamLimit;
			$downstreamLimit = $requestParas->downstreamLimit;
			$securityType = $requestParas->securityType;

			$isEditWlan = false;
            $cmd = "config_wlan edit_wlan ssid ".$oldssid;
			if(0 != strcmp($requestParas->hidden, "")){
				$cmd = $cmd." hidden ".$hidden;
				$isEditWlan = true;
			}
			if(0 != strcmp($enable, "")){
				$cmd = $cmd." enable ".$enable;
				$isEditWlan = true;
			}
			if(0 != strcmp($maxClients, "")){
				$cmd = $cmd." maxsta ".$maxClients;
				$isEditWlan = true;
			}
			if(0 != strcmp($probeThreshold, "")){
				$cmd = $cmd." probe_threshold ".$probeThreshold;
				$isEditWlan = true;
			}
			if(0 != strcmp($vlanId, "")){
				$cmd = $cmd." vlan ".$vlanId;
				$isEditWlan = true;
			}
			if(0 != strcmp($upstreamLimit, "")){
				$cmd = $cmd." upstream_limit ".$upstreamLimit;
				$isEditWlan = true;
			}
			if(0 != strcmp($downstreamLimit, "")){
				$cmd = $cmd." downstream_limit ".$downstreamLimit;
				$isEditWlan = true;
			}
			if(0 != strcmp($requestParas->ssid, "")){
				$cmd = $cmd." newssid ".$newssid;
				$isEditWlan = true;
			}

			$crypto = new Crypto();
			$encryption = $requestParas->encryption;
			$key = secretEscape($crypto->decode($requestParas->key));
			$authServer = $requestParas->authServer;
			$authPort = $requestParas->authPort;
			$authSecret = secretEscape($crypto->decode($requestParas->authSecret));
			$acctServer = $requestParas->acctServer;
			$acctPort = $requestParas->acctPort;
			$acctSecret = secretEscape($crypto->decode($requestParas->acctSecret));
			$fast = $requestParas->fast;
			$okc = $requestParas->okc;

			if(0 == strcmp($securityType, "Open")){
				$cmd = $cmd." encryption none";
				$isEditWlan = true;
			}
			if(0 != strcmp($encryption, "")){
				$cmd = $cmd." encryption ".$encryption;
				$isEditWlan = true;
			}
			if(0 != strcmp($requestParas->key, "")){
				$cmd = $cmd." key ".$key;
				$isEditWlan = true;
			}
			if(0 != strcmp($authServer, "")){
				$cmd = $cmd." auth_server ".$authServer;
				$isEditWlan = true;
			}
			if(0 != strcmp($authPort, "")){
				$cmd = $cmd." auth_port ".$authPort;
				$isEditWlan = true;
			}
			if(0 != strcmp($requestParas->authSecret, "")){
				$cmd = $cmd." auth_secret ".$authSecret;
				$isEditWlan = true;
			}
			if(0 != strcmp($acctServer, "")){
				$cmd = $cmd." acct_server ".$acctServer;
				$isEditWlan = true;
			}
			if(0 != strcmp($acctPort, "")){
				$cmd = $cmd." acct_port ".$acctPort;
				$isEditWlan = true;
			}
			if(0 != strcmp($requestParas->acctSecret, "")){
				$cmd = $cmd." acct_secret ".$acctSecret;
				$isEditWlan = true;
			}
			if(0 != strcmp($requestParas->fast, "")){
				$cmd = $cmd." ieee80211r ".$fast;
				$isEditWlan = true;
			}
			if(0 != strcmp($requestParas->okc, "")){
				$cmd = $cmd." okc ".$okc;
				$isEditWlan = true;
			}

			if($isEditWlan){
				//echo "cmd:".$cmd;
				exec($cmd, $output, $return_wlan);

				$pos_old = strpos($oldssid, "'");
				$pos_new = strpos($newssid, "'");
				if(0 === $return_wlan){
					if((FALSE !== $pos_old) || (FALSE !== $pos_new)){
						$log_info = "\"".$cmd." result:success\"";
					}else{
						$log_info = "'".$cmd." result:success'";
					}
				}else{
					if((FALSE !== $pos_old) || (FALSE !== $pos_new)){
						$log_info = "\"".$cmd." result:fail\"";
					}else{
						$log_info = "'".$cmd." result:fail'";
					}
				}
				exec("logger -t web -p 5 ".$log_info);
			}

			$isEditCaptivePortal = false;
			$captivePortal = $requestParas->captivePortal;
			if(0 != strcmp($captivePortal, "")){
				if(($isEditWlan) && (0 === $return_wlan)){
					if(0 != strcmp($newssid, "")){
						$ssid = $newssid;
					}else{
						$ssid = $oldssid;
					}
				}else{
					$ssid = $oldssid;
				}

				if(0 == strcmp($captivePortal, "Yes")){
					$cmd = "eag_uci add ".$ssid;
				}else{
					$cmd = "eag_uci del ".$ssid;
				}
				$isEditCaptivePortal = true;
				//echo "cmd:".$cmd;
				exec($cmd, $output, $return_eag);
				sleep(3);
				$return_restart = reload_eag_config();

				$pos = strpos($ssid, "'");
				if((0 === $return_eag) && ($return_restart)){
					if(FALSE !== $pos){
						$log_info = "\"".$cmd." result:success\"";
					}else{
						$log_info = "'".$cmd." result:success'";
					}
				}else{
					if(FALSE !== $pos){
						$log_info = "\"".$cmd." result:fail\"";
					}else{
						$log_info = "'".$cmd." result:fail'";
					}
				}

				exec("logger -t web -p 5 ".$log_info);
			}

			$isSuccess = false;
			if(($isEditWlan) && ($isEditCaptivePortal)){
				if((0 === $return_wlan) && (0 === $return_eag) && ($return_restart)){
					$isSuccess = true;
				}
			}else if($isEditWlan){
				if(0 === $return_wlan){
					$isSuccess = true;
				}
			}else if($isEditCaptivePortal){
				if((0 === $return_eag) && ($return_restart)){
					$isSuccess = true;
				}
			}else{
				$isSuccess = true;
			}

			if($isSuccess){
				$response = array(
							'success' => true,
							'msg' => 'wlan_edit_success');
			}else{
				$response = array(
							'success' => false,
							'msg' => 'wlan_edit_fail');
			}

			echo json_encode($response);
    	}catch(Exception $e){
			$response = array(
						'success' => false,
						'msg' => $e->getMessage());
			echo json_encode($response);

			$log_info = "config wlan: ".$e->getMessage();
			exec("logger -t web -p 3 ".$log_info);
		}
	}
);

/**
*	get wlan list
**/
$app->get(
    '/wlans',
    function (){
    	$cmd_wlanList = "config_wlan list_wlan";
        exec($cmd_wlanList, $lines_wlanList, $return_wlanList);
        //var_dump($lines_wlanList);

        if(0 === $return_wlanList){
        	$wlanList = array();
			$index = 0;
			$enabledWlanNum = 0;
			$disabledWlanNum = 0;
			$upstreamLimit = 0;
			$downstreamLimit = 0;
			$macfilter = "";
			$blacklistNum = 0;
            $blacklist = array();

			foreach ($lines_wlanList as $linenum => $line) {
				if(0 == strcmp("", $line)){
					if(1 == $hiddenInt){
						$hidden = "Yes";
					}else{
						$hidden = "No";
					}

					if(1 == $enableInt){
						$enable = true;
						$enabledWlanNum++;
					}else{
						$enable = false;
						$disabledWlanNum++;
					}

					$vlanId = 0;
					$pos = strpos($network, "vlan");
					if(FALSE !== $pos){
						sscanf(substr($network, 4), "%d", $vlanId);
					}

					$captivePortal = "No";
					$cmd = "eag_uci get ".$ssid;
					$last_line = exec($cmd, $lines, $return);
					if(0 === $return){
						sscanf($last_line, "%d", $captivePortalInt);
						if(1 === $captivePortalInt){
							$captivePortal = "Yes";
						}
					}

					if(0 == strcmp($macfilter, "deny")){
						$blacklistNum = count($blacklist);
					}

					$crypto = new Crypto();
					$secret = $crypto->encode($secret);
					$authSecret = $crypto->encode($authSecret);
					$acctSecret = $crypto->encode($acctSecret);

					$wlan = array(
								'ssid' => $ssid,
								'frequence' => $frequence,
								'hidden' => $hidden,
								'enable' => $enable,
								'maxClients' => $maxClients,
								'probeThreshold' => $probeThreshold,
								'vlanId' => $vlanId,
								'upstreamLimit' => $upstreamLimit,
								'downstreamLimit' => $downstreamLimit,
								'securityType' => $securityType,
								'encryption' => $encryption,
								'key' => $secret,
								'authServer' => $authServer,
								'authPort' => $authPort,
								'authSecret' => $authSecret,
								'acctServer' => $acctServer,
								'acctPort' => $acctPort,
								'acctSecret' => $acctSecret,
								'fast' => $fast,
								'okc' => $okc,
								'captivePortal' => $captivePortal,
								'blacklistNum' => $blacklistNum,
								'blacklist' => $blacklist);

					$wlanList[$index] = $wlan;
					$index++;
					$upstreamLimit = 0;
                    $downstreamLimit = 0;
					$macfilter = "";
					$blacklistNum = 0;
                    $blacklist = array();
				}

				$pos = strpos($line, "=");
				if(FALSE === $pos){
					continue;
				}

				$key = substr($line, 0, $pos);
				$value = substr($line, $pos+1);
				switch($key){
					case "ssid":
						$ssid = $value;
						break;
					case "hidden":
						sscanf($value, "%d", $hiddenInt);
						break;
					case "enable":
						sscanf($value, "%d", $enableInt);
						break;
					case "maxsta":
						sscanf($value, "%d", $maxClients);
						break;
					case "probe_threshold":
						sscanf($value, "%d", $probeThreshold);
						break;
					case "frequence":
						$frequence = $value;
                        break;
                    case "network":
						$network = $value;
						break;
					case "upstream_limit":
						sscanf($value, "%d", $upstreamLimit);
                        break;
                    case "downstream_limit":
						sscanf($value, "%d", $downstreamLimit);
						break;
                    case "encryption":
                    	$encryption = $value;
                    	if(0 == strcmp($encryption, "none")){
                    		$securityType = "open";
                    		$encryption = "";
                    		$secret = "";
							$authServer = "";
							$authPort = 1812;
							$authSecret = "";
							$acctServer = "";
							$acctPort = 1813;
							$acctSecret = "";
							$fast = false;
							$okc = false;
                    	}else if(stristr($encryption, "psk")){
                    		$securityType = "personal";
							$authServer = "";
							$authPort = 1812;
							$authSecret = "";
							$acctServer = "";
							$acctPort = 1813;
							$acctSecret = "";
                            $okc = false;
                    	}else{
                    		$securityType = "enterprise";
                    		$secret = "";
                    	}
                    	break;
                    case "key":
                    	$secret = $value;
                        break;
                    case "auth_server":
                    	$authServer = $value;
                    	break;
                    case "auth_port":
                    	sscanf($value, "%d", $authPort);
                        break;
                    case "auth_secret":
						$authSecret = $value;
						break;
                    case "acct_server":
						$acctServer = $value;
						break;
					case "acct_port":
						sscanf($value, "%d", $acctPort);
						break;
					case "acct_secret":
						$acctSecret = $value;
						break;
					case "ieee80211r":
						if(1 == $value){
							$fast = true;
						}else{
							$fast = false;
						}
						break;
                    case "okc":
						if(1 == $value){
							$okc = true;
						}else{
							$okc = false;
						}
						break;
					case "macfilter":
						$macfilter = $value;
						break;
					case "maclist":
						$list = explode(" ", $value);
						for($x=0; $x<count($list); $x++) {
                          $blacklist[$x] = array( 'blacklistMac' => $list[$x] );
                        }
						break;
				}
			}

			$result = array(
						'enabledWlanNum' => $enabledWlanNum,
						'disabledWlanNum' => $disabledWlanNum,
						'wlanList' => $wlanList);

			$response = array(
						'success' => true,
						'result' => $result);
        }else{
			$response = array(
						'success' => false,
						'result' => 'get wlans fail!');
		}

		echo json_encode($response);
	}
);

?>