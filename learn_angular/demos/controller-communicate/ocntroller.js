angular.module("app", []).controller("parentCtr",

function ($scope) {
    $scope.$on("Ctr1NameChange",

    function (event, msg) {
        console.log("parent", msg);
        $scope.$broadcast("Ctr1NameChangeFromParrent", msg);
    });
}).controller("childCtr1", function ($scope) {
    $scope.change = function (name) {
        console.log("childCtr1", name);
        $scope.$emit("Ctr1NameChange", name);
    };
}).controller("childCtr2", function ($scope) {
    $scope.$on("Ctr1NameChangeFromParrent",

    function (event, msg) {
        console.log("childCtr2", msg);
        $scope.ctr1Name = msg;
    });
});