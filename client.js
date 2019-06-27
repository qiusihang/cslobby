var ws = new WebSocket("ws://localhost:5000");

var randomid = function(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

var nickname = "Anonymous."+randomid(5);
var channel = "public";

window.onload = function()
{
    var url = location.search;

    if (url.indexOf("?") != -1)
    {
        var str = url.substr(1);
        var strs = str.split("&");
        for ( var i = 0 ; i < strs.length ; i ++ )
        {
            var params = strs[i].split('=');
            if ( params.length < 2 ) continue;
            if ( params[0] == "nickname"){
                nickname = params[1].replace(/[\s\/#!$%\^&\*;:{}=\'"`~()]/g, "");
            }
            if ( params[0] == "channel") {
                channel = params[1].replace(/[\s\/#!$%\^&\*;:{}=\'"`~()]/g, "");
            }
        }
    }
}

ws.onopen = function(){
    console.log("Server Connected!");
    ws.send("("+nickname+"&"+channel+")__join__");
};

ws.onmessage = function(e){
    bubble(e.data);
};

ws.onclose = function(e){
    console.log("WebSocketClosed!");
    bubble("Connection close.");
};

ws.onerror = function(e){
    console.log("Connection Error!");
    bubble("Connection error.");
};

var send = function() {
    text = document.getElementById("message").value;
    ws.send("("+nickname+"&"+channel+")"+text);
}

var bubble = function(message) {
    var row = document.getElementById("history").insertRow();
    var cell = row.insertCell();
    cell.innerHTML = bubble_content(message);
    var div = document.getElementById("history-container");
    div.scrollTop = div.scrollHeight;
}

var bubble_content = function(message) {
    var i = message.indexOf(":");
    if ( i < 0 )
        return "<div class=\"notification\"><p>" + message + "</p></div>";
    var t = new Date();
    var result = "<span style=\"font-size:10px;color:#666666;\">";
    var username = message.substring(0,i);
    if (username != "__you__") result += username + "  "; // show username
    result += ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2) + "</span><br/>"; // show time hh:mm
    result += message.substring(i+1,message.length); // show message
    if (username == "__you__")
        result = "<div class=\"right-arrow\"></div><div class=\"bubble-me\">" + result + "</div>";
    else
        result = "<div class=\"left-arrow\"></div><div class=\"bubble\">" + result + "</div>";
    return result;
}

var onKeyPress = function(e) {
    e = e || window.event;
    if (e.keyCode == 13) {
        e.returnValue = false;
        if ( document.getElementById("message").value == "" ) return;
        send();
        document.getElementById("message").value = "";
    }
}
