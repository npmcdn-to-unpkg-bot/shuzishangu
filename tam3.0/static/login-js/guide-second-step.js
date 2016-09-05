angular.module('login')
.controller("secondStepCtrl",['$scope','$modal','$modalInstance','toastr','wizardService','ntpTimeZoneConstant', function($scope,$modal,$modalInstance,toastr,wizardService,ntpTimeZoneConstant){
    $scope.second = "";
    if(wizardService.getCountryFlag()){
        $scope.second = "2/3";
    }
    //country code array
    $scope.countryCodeArray = [
        {name:"Algeria",value:"DZ"},{name:"Argentina",value:"AR"},{name:"Australia",value:"AU"},{name:"Austria",value:"AT"},
        {name:"Bahrain",value:"BH"},{name:"Bermuda",value:"BM"},{name:"Bolivia",value:"BO"},{name:"Brazil",value:"BR"},
        {name:"Canada",value:"CA"},{name:"Chile",value:"CL"},{name:"China",value:"CN"},{name:"Colombia",value:"CO"},{name:"Czech Republic",value:"CZ"},
        {name:"Denmark",value:"DK"},{name:"Dominican Republic",value:"DO"},
        {name:"El Salvador",value:"SV"},{name:"Estonia",value:"EE"},
        {name:"Finland",value:"FI"},{name:"France",value:"FR"},
        {name:"Germany",value:"DE"},{name:"Greece",value:"GR"},{name:"Guatemala",value:"GT"},
        {name:"Hong Kong",value:"HK"},
        {name:"Iceland",value:"IS"},{name:"India",value:"IN"},{name:"Indonesia",value:"ID"},{name:"Islamic Republic of Pakistan",value:"PK"},{name:"Italy",value:"IT"},
        {name:"Jamaica",value:"JM"},{name:"Jordan",value:"JO"},
        {name:"Kuwait",value:"KW"},
        {name:"Lebanon",value:"LB"},{name:"Liechtenstein",value:"LI"},{name:"Lithuania",value:"LT"},{name:"Luxembourg",value:"LU"},
        {name:"Mauritius",value:"MU"},{name:"Mexico",value:"MX"},{name:"Morocco",value:"MA"},
        {name:"Netherlands",value:"NL"},{name:"New Zealand",value:"NZ"},{name:"Norway",value:"NO"},
        {name:"Oman",value:"OM"},
        {name:"Peru",value:"PE"},{name:"Philippines",value:"PH"},{name:"Poland",value:"PL"},{name:"Portugal",value:"PT"},{name:"Puerto Rico",value:"PR"},
        {name:"Qatar",value:"QA"},
        {name:"Republic of Korea",value:"KR"},{name:"Romania",value:"RO"},
        {name:"Saudi Arabia",value:"SA"},{name:"Serbia and Montenegro",value:"CS"},{name:"Singapore",value:"SG"},{name:"Slovak Republic",value:"SK"},{name:"South Africa",value:"ZA"},{name:"Spain",value:"ES"},{name:"Sri Lanka",value:"LK"},{name:"Switzerland",value:"CH"},
        {name:"Taiwan",value:"TW"},{name:"Tunisia",value:"TN"},
        {name:"United Arab Emirates",value:"AE"},{name:"United Kingdom",value:"GB"},
        {name:"Venezuela",value:"VE"}];
    //the default value of country code
    $scope.countryCode = $scope.countryCodeArray[0];

    //timezone
    $scope.timeZoneArray = ntpTimeZoneConstant.utc;

    $scope.selectTimeZone = $scope.timeZoneArray[0];

    $scope.firstStepOk = function(){
        $scope.countryCode = this.countryCode;
        wizardService.setCountryCode($scope.countryCode.value);

        var timezone = this.selectTimeZone;
        var arr = timezone.split("@");
        var city = arr[0];
        var zone = arr[1];

        wizardService.setTimezone(zone);
        wizardService.setCity(city);
        
        $modalInstance.dismiss('cancel');
        var instance = $modal.open({
            templateUrl: 'guide-three-step.html',
            controller:"threeStepCtrl",
            size: 'md',
            backdrop: 'static',
            keyboard:false
        });

    };
           
}])
;

