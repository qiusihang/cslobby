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
    var params = parse_query_string();
    nickname = (params["nickname"] === undefined ? nickname : params["nickname"]);
    channel = (params["channel"] === undefined ? channel : params["channel"]);
}

ws.onopen = function(){
    console.log("Server Connected!");
    ws.send("("+nickname+"&"+channel+")__join__");
};

ws.onmessage = function(e){
    elements = e.data.split("#$%^&");
    elements.forEach(function(element){
        bubble(element);
    });
    // bubble(e.data);
};

ws.onclose = function(e){
    console.log("WebSocketClosed!");
    bubble("Connection closed.");
};

ws.onerror = function(e){
    console.log("Connection Error!");
    bubble("Connection error.");
};

var send = function(text) {
    ws.send("("+nickname+"&"+channel+")"+text);
}


var loading_cell = document.createElement("div");

var loading = function() {              // show loading animation
    if ( loading_cell.parentElement != undefined ) loading_cell.parentElement.style = "display:none";
    var row = document.getElementById("history").insertRow();
    loading_cell = row.insertCell();
    loading_cell.innerHTML = "<div class=\"lds-ellipsis\"><div></div><div></div><div></div><div></div></div>";
    to_bottom();
}

var bubble = function(message) {
    // if the message is "loading", show loading animation
    // if the message does not include ":", show the message as a notification
    // if the message includes ":", then it as a conversation bubble, the substring before ":" is the username

    if ( message == undefined || message.length == undefined ) return;
    if ( message == "loading" ) {
        loading();
        return;
    }
    if ( loading_cell.parentElement != undefined ) loading_cell.parentElement.style = "display:none";
    var row = document.getElementById("history").insertRow();
    var cell = row.insertCell();
    cell.innerHTML = bubble_content(message);
    to_bottom();
}

var bubble_content = function(message) {
    var i = message.indexOf(":");
    if ( i < 0 )
        return "<div class=\"notification\"><p>" + message + "</p></div>";

    var username = message.substring(0,i);
    var content = message.substring(i+1,message.length);
    var i = content.indexOf(":");
    var time = content.substring(0,i).split('-'); // YYYY-MM-DD-hh-mm-ss

    var result = "";
    if (username != "__you__") {
        result = "<span style=\"font-size:10px;color:#999999;\">" + username + "  ";  // show username
    } else {
        result = "<span style=\"font-size:10px;color:#d9d9d9;\">"
    }
    result += time[3] + ":" + time[4] + "</span><br/>"; // show time hh:mm
    result += content.substring(i+1,content.length); // show message
    if (username == "__you__")
        result = "<div class=\"right-arrow\"></div><div class=\"bubble-me\">" + result + "</div>";
    else
        result = "<div class=\"left-arrow\"></div><div class=\"bubble\">" + result + "</div>";
    return result;
}


var click_send = function() {
    var m = document.getElementById("message");
    if ( m.value == "" ) return;
    if ( m.value.length > 5000 ) {
        alert("Your message is too long!");
        return;
    }
    send(m.value);
    m.value = "";
    m.focus();
}

var to_bottom = function() {
    var div = document.getElementById("history-container");
    div.scrollTop = div.scrollHeight;   // go to the bottom
}

var onKeyDown = function(e) {
    e = e || window.event;
    if (e.keyCode == 13 && e.shiftKey) {
        return;
    }
    if (e.keyCode == 13) {
        e.returnValue = false;
        click_send();
    }
}

function parse_query_string() {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        if (typeof query_string[key] === "undefined") {
            query_string[key] = decodeURIComponent(value);
        } else if (typeof query_string[key] === "string") {
            var arr = [query_string[key], decodeURIComponent(value)];
            query_string[key] = arr;
        } else {
            query_string[key].push(decodeURIComponent(value));
        }
    }
    return query_string;
}
