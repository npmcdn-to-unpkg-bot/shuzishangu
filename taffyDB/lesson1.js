/**
 * Created by liushan on 2016/8/17.
 */
var results = [
    {
        "mac":"34:e7:0b:a1:b2:c0",
        "ip":"192.168.20.23",
        "prio":"0",
        "state":"3",
        "role":"1",
        "auth":"1"
    },
    {
        "mac":"4c:48:da:24:ef:90",
        "ip":"192.168.20.26",
        "prio":"0",
        "state":"3",
        "role":"2",
        "auth":"1"
    }
];
var aplist = TAFFY(results);
//add records
aplist.insert({
    "mac":"4c:48:da:24:ef:90",
    "ip":"192.168.20.27",
    "prio":"0",
    "state":"3",
    "role":"2",
    "auth":"1"
});

console.log(aplist({"state":"3"}).count());
console.log(aplist().limit(2).each(function(r){console.log(r.ip)}));

console.log(aplist({"state":"3"}).update({"state":"2"}));
console.log(aplist({"state":"3"}).count());