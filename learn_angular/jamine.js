//test suite    spec 细则
describe('unit test:MainController',function(){
    describe('index method',function(){
        it('a passing spec',function(){
            //匹配器函数
            expect(true).toBe(true);

        })
    })
});

describe('myApp',function(){
    beforeEach(angular.mock.module('myApp'));
    beforeEach(angular.mock.inject(function($rootScope){
        scope = $rootScope.new();
    }))
    it('')
});