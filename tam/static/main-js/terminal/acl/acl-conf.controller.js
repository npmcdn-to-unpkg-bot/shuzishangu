/**
 * Created by shensf on 2016/3/24.
 */
angular.module("module.terminal.acl")
    .controller("TerminalAclConfController", ['$scope', '$http', '$modalInstance','$translate','authentifiedRequest', 'InterService', 'batchSyncConfig', 'toastr', function($scope, $http, $modalInstance, $translate, authentifiedRequest, InterService, batchSyncConfig, toastr) {
        $scope.skin = InterService.skin;
        $scope.InterService = InterService;

        // $scope.aps = InterService.getCanConfigAps();

        // $scope.$watch('InterService', function(newVal, oldVal) {
        //     if (newVal !== oldVal) {
        //         $scope.aps = InterService.getCanConfigAps();
        //     }
        // }, true);

        /**
         * 页面参数对象初始化
         */
        $scope.ACLDetailGroupList = [];
        $scope.defaultACLAction = true;
        $scope.aclDetail = false;
        $scope.aclEdit = false;
        $scope.aclAdd = false;
        $scope.isAddACL = false;
        $scope.isEditACL = false;
        $scope.ACLIPProtocal = ["ALL","TCP", "UDP", "ICMP"];
        $scope.ACLTarget = ["ACCEPT", "REJECT"];
        
        $scope.ACLDetailTemp = {
             "src_ip":"",
             "src_port":"",
             "dest_ip":"",
             "dest_port":"",
             "proto":"",
             "target":""
        };

        $scope.ShowEditACL = function(currentDetail){
            $scope.aclDetail = false;
            $scope.aclEdit = true;
            $scope.aclAdd = false;
            $scope.ACLDetailTemp=currentDetail;
        };

        $scope.ShowAclDetail = function(selectACL){
            $scope.aclDetail = true;
            $scope.aclEdit = false;
            $scope.aclAdd = false;
            $scope.ACLDetailTemp = selectACL;
        };
        $scope.ShowAddACL = function(){
            $scope.ACLDetailTemp = {};
            $scope.ACLDetailTemp.proto = "TCP";
            $scope.ACLDetailTemp.target = "REJECT";
            $scope.aclAdd = true;
            $scope.aclDetail = false;
            $scope.aclEdit = false;
        };

        $scope.aclGetDetailRule = function(){
            var params = {};
            var old_length = 0;
            if(null != $scope.ACLDetailGroupList){
                old_length = $scope.ACLDetailGroupList.length;
            }
            authentifiedRequest.get("/aclrule", params, function(data,  status){
                if(status == 200 && data != null && data.success){
                    $scope.ACLDetailGroupList = data.result;
                    if(null != $scope.ACLDetailGroupList){
                        $scope.aclDetail = true;
                        $scope.aclAdd = false;
                        $scope.aclEdit = false;
                        if($scope.tempindex>0 && $scope.isEditACL){
                          /*  if acl be edit,tempindex is not null*/
                            $scope.ACLDetailTemp = $scope.ACLDetailGroupList[$scope.tempindex];
                        } else if($scope.isAddACL == true){
                           var new_length = $scope.ACLDetailGroupList.length;
                            if(new_length > old_length){
                                $scope.ACLDetailTemp = $scope.ACLDetailGroupList[new_length-1];
                            }
                        } else if($scope.isEditACL == false && $scope.isAddACL == false){
                            $scope.ACLDetailTemp = $scope.ACLDetailGroupList[0];
                        }
                    }
                    else{
                        $scope.aclDetail = false;
                    }
                }
            },function(){
            })

        };

        $scope.getDefaultACLAction = function(){
            var params = {};
            authentifiedRequest.get("/getdefaultACL", params, function(data, status){
                if(status == 200 && data != null && data.success){
                    $scope.defaultACLAction = data.result;
                }
            },function(){
            })
        };

        $scope.setDefaultACLAction = function(){
            //var operatorMsg = 'Set default ACL action';
            var operatorMsg = 'access_set_acl_1';
            var requestParas = JSON.stringify($scope.defaultACLAction);
            batchSyncConfig.request("put", "/setdefaultACL", null, requestParas, function(){
                $scope.getDefaultACLAction();
            },null, operatorMsg);
        };
        $scope.DelACL = function(selectACL){
            var operatorMsg = 'access_del_acl_1';
            var url = "/deleterule/" + selectACL.rule;
            /*var confirm_tip = "Do you confirm to delete this acl rule?";*/
            var confirm_tip = $translate.instant("access_del_acl_2");
            bootbox.confirm(confirm_tip, function(result){
                if(result){
                    batchSyncConfig.request("delete", url, null, null, function(){
                        $scope.aclGetDetailRule();
                    },null, operatorMsg);
                }
            })
        };
       
        $scope.filterDuplicateObject = function(array, acltemp) {
            var temp = false;
            var status = false;
            var tempobj = acltemp;

            //add the key acltemp is not
            status = tempobj.hasOwnProperty('src_ip');
            if(false == status){
                tempobj.src_ip = "";
            }

            status = tempobj.hasOwnProperty('src_port');
            if(false == status){
                tempobj.src_port = "";
            }

            status = tempobj.hasOwnProperty('dest_ip');
            if(false == status){
                tempobj.dest_ip = "";
            }

            status = tempobj.hasOwnProperty('dest_port');
            if(false == status){
                tempobj.dest_port = "";
            }

            //compare key and value
            $.each(array,function(i,val){
                if((val.src_ip == tempobj.src_ip) && 
                    (val.src_port == tempobj.src_port) &&
                    (val.dest_ip == tempobj.dest_ip) &&
                    (val.dest_port == tempobj.dest_port) &&
                    (val.proto == tempobj.proto)){
                        temp = true;
                        return false;
                }
            });
            
            return temp;
        }

        $scope.AddACL = function(){
            var operatorMsg = 'access_add_acl_1';
            $scope.isEditACL = false;
            $scope.isAddACL = true;

            if(null != $scope.ACLDetailGroupList){
                if($scope.ACLDetailGroupList.length >= 128){
                    /*toastr.info('ACL rules already pass 128!', '');*/
                    toastr.info($translate.instant("access_add_acl_2"), '');
                    return ;
                }

                var index = $scope.filterDuplicateObject($scope.ACLDetailGroupList, $scope.ACLDetailTemp);
                if(true == index){
                    toastr.info($translate.instant("access_add_acl_3"), '');
                    return ;
                }
            }
            var requestParas = JSON.stringify($scope.ACLDetailTemp);
            batchSyncConfig.request("put", "/addfirewall", null, requestParas, function(){
                $scope.aclGetDetailRule();
               // $scope.Cancel();
                $scope.ACLDetailTemp={};
            },null, operatorMsg);
        };

        $scope.EditACL = function(){
           /* var operatorMsg = 'Modify ACL rule';*/
            var operatorMsg = 'access_set_acl_2';
            $scope.isAddACL = false;
            $scope.isEditACL = true;
            var requestParas = JSON.stringify($scope.ACLDetailTemp);
            $scope.tempindex= $.inArray($scope.ACLDetailTemp,$scope.ACLDetailGroupList);
            batchSyncConfig.request("put", "/modifyfirewall", null, requestParas, function(){
                $scope.aclGetDetailRule();
                //$scope.Cancel();
            },null, operatorMsg);
        }

        /**
         * �رհ�ť
         */
        $scope.close = function() {
            $modalInstance.close();
        };
        $scope.Cancel = function() {
            $scope.aclAdd = false;
            $scope.aclDetail = false;
            $scope.aclEdit = false;
        };

        $scope.moveACLlist = function(acla, aclb){
            /*var operatorMsg = 'Move ACL rule';*/
            var operatorMsg = 'access_set_acl_3';
            var moveacl = [];
            moveacl.push(acla);
            moveacl.push(aclb);
            var requestParas = JSON.stringify(moveacl);
            batchSyncConfig.request("put", "/moveACLlist", null, requestParas, function(){
                $scope.aclGetDetailRule();
            },null,operatorMsg);
        }

        $scope.Moveup = function(index){
            $scope.temp = "";
            $scope.temp = $scope.ACLDetailGroupList[index-1];
            $scope.ACLDetailGroupList[index-1] = $scope.ACLDetailGroupList[index];
            $scope.ACLDetailGroupList[index] = $scope.temp;
            $scope.temp = "";
            var temp1 = $scope.ACLDetailGroupList[index];
            var temp2 = $scope.ACLDetailGroupList[index-1];
            $scope.moveACLlist(temp1, temp2);
        };

        $scope.Movedown = function(index){
            $scope.temp = $scope.ACLDetailGroupList[index+1];
            $scope.ACLDetailGroupList[index+1] = $scope.ACLDetailGroupList[index];
            $scope.ACLDetailGroupList[index] = $scope.temp;
            $scope.temp = "";
            var temp1 = $scope.ACLDetailGroupList[index];
            var temp2 = $scope.ACLDetailGroupList[index+1];
            $scope.moveACLlist(temp1, temp2);
 
        };

        /**
         *
         *
         */
        $scope.aclGetDetailRule();
        $scope.getDefaultACLAction();
    }])
;