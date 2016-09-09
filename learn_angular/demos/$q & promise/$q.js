var testCtrl = function($q){
    var defer = $q.defer();
    var promise = defer.promise;
    promise.then(function(data){console.log('success'+data);},
                 function(data){console.log('failture'+data);});
    defer.resolve('xx');

};



//case1 :promise的金字塔问题
remotedb.allDocs({
  include_docs: true,
  attachments: true
}).then(function (result) {
  var docs = result.rows;
  docs.forEach(function(element) {
    localdb.put(element.doc).then(function(response) {
      alert("Pulled doc with id " + element.doc._id + " and added to local db.");
    }).catch(function (err) {
      if (err.status == 409) {
        localdb.get(element.doc._id).then(function (resp) {
          localdb.remove(resp._id, resp._rev).then(function (resp) {
// et cetera...
// 正确的风格应该是这样:
remotedb.allDocs(...).then(function (resultOfAllDocs) {
  return localdb.put(...);
}).then(function (resultOfPut) {
  return localdb.get(...);
}).then(function (resultOfGet) {
  return localdb.put(...);
}).catch(function (err) {
  console.log(err);
}); 

// 这种写法被称为 composing promises ，是 promises 的强大能力之一。每一个函数只会在前一个 promise
//  被调用并且完成回调后调用，并且这个函数会被前一个 promise 的输出调用

// 新手错误 #2： WTF, 用了 promises 后怎么用 forEach?
// 简而言之，forEach()/for/while 并非你寻找的解决方案。你需要的是 Promise.all():
db.allDocs({include_docs: true}).then(function (result) {
  return Promise.all(result.rows.map(function (row) {
    return db.remove(row.doc);
  }));
}).then(function (arrayOfResults) {
  // All docs have really been removed() now!
});

// 新手错误 #3： 忘记使用 .catch()

// 这是另一个常见的错误。单纯的坚信自己的 promises 会永远不出现异常，很多开发者会忘记在他们的代码中
// 添加一个 .catch()。然而不幸的是这也意味着，任何被抛出的异常都会被吃掉，并且你无法在 console 中观
// 察到他们。这类问题 debug 起来会非常痛苦。


