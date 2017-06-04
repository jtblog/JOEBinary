var ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3956');

//var ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3956');

ws.onopen = function(evt) {
    ws.send(JSON.stringify({authorize:'1aStI5HCcty55Ly'}));
	//ws.send(JSON.stringify({authorize:'1aStI5HCcty55Ly10'}));
};

ws.onmessage = function(msg) {
   var data = JSON.parse(msg.data);
   
   var strresp = JSON.stringify(data);
   
   if(~strresp.indexOf("The token is invalid")){
	   alert("Invalid tokin");
   }else{
	   alert(strresp);
	   ws.send(JSON.stringify({authorize:'1aStI5HCcty55Ly10'}));
	  // if(~strresp.indexOf("loginid")){
		  // a().send(JSON.stringify({ticks:'R_100'}));
	   //}else{
		//   alert(strresp);
	  // }
	   //var loginid = data.authorize.loginid;
   }
};
