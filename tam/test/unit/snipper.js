var url_pro = "http://";
var url_port=":8080";
$scope.aplistinfo = {};
$scope.uploadflag = {'connect':false,'num':0,'mac':''};
$scope.timer = null;

$scope.flag = {"isEditApname":fasle,'isEditIp':false,'showDhcp':true,"apinfoshow":true,"uploadzone":true,"noEditLoc":true};
$scope.edit = {"apNewName":'',"mac":'',"proto":'',"ipaddr":'',"newMask":'',"gateWay":''};


        function FirstgetAPList(){
            if($scope.timer != null){
                $interval.cancel($scope.timer);
            }
            $scope.aplistdetailinfo={"PVC":[],"SVC":[],"MEM":[],"working":[],"joining":[]};
            APService.HttpGetApListInfo(function(){
                getaplistdetailinfo();
                $scope.clusterInfo = ClusterService.getClusterinfoSer();
                $scope.$emit("to-aplist-parent", true);
            });
        }