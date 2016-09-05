/**
 * Created by liushan on 2016/8/16.
 */
describe('E2E: content',function(){
    it('should have a sign in button',function(){
        browser().navigatorTo('/#/');
        expect(
            element('a#login').html()
        ).toEqual('try in sign in');
    })
});


var rootEle = document.querySelector('appanel');
var ele = angular.element(rootEle);
ele.scope();