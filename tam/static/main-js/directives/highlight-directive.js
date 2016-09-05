/**
 * Created by Administrator on 16-7-7.
 */

angular.module('main')
    .directive("highLight", [function(){
        return {
            restrict: "A",
            link: function(scope, element, attrs){
                element.bind("click", function(){
                    element.addClass("highLight");
                    element.siblings().removeClass("highLight");
                });
            }
        }
    }])
;
