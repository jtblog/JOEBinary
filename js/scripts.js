var ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3956');
var syms = [];

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
	  	if(~strresp.indexOf("loginid")){
	  		//Get active symbols
	  		ws.send(JSON.stringify({active_symbols:'full'}));
	   	}else{
	   		if(~strresp.indexOf("active_symbols")){
	   			var active_syms = data.active_symbols;
	   		
	   			for (var i = 0; i < active_syms.length; i++) { 
			    	if(active_syms[i].symbol_type == "forex"){
                 		syms.push(active_syms[i].symbol);
                   	}
				}
				ws.send(JSON.stringify({ticks: JSON.stringify(syms)}));
				//alert(JSON.stringify(syms));
	   		}
	   		
	  	}
	   //var loginid = data.authorize.loginid;
   }
};
