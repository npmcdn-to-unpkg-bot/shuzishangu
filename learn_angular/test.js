/**
 * Created by liushan on 2016/8/12.
 */
var res = [1,1,1];
Array.prototype.forEach(res,function(item,index){
    return item*2;
})


function sendText(){
    var msg = {
        type:"message",
        text:document.getElementById('text').value,
        id:'clientID',
        date:Date.now()
    };
      // 将其作为 JSON 格式字符串发送。
  exampleSocket.send(JSON.stringify(msg));
  
  // 清空文本输入框
  document.getElementById("text").value = "";
}

