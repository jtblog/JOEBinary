document.getElementById("ta").style.visibility = "hidden";
var ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3956');
var syms = [];
var currency_pairs = [];
//var d = new Date(1496610240);
//alert(d.toString());

ws.onopen = function(evt) {
    //ws.send(JSON.stringify({authorize:'1aStI5HCcty55Ly'}));
	//ws.send(JSON.stringify({authorize:'1aStI5HCcty55Ly10'}));
};

ws.onmessage = function(msg) {
   var data = JSON.parse(msg.data);
   
   var strresp = JSON.stringify(data);
   
   if(~strresp.indexOf("The token is invalid")){
	   	document.getElementById("form").style.visibility = "visible";
		document.getElementById("ta").style.visibility = "hidden";
		alert("Invalid tokin");
   }else{
	  	if(~strresp.indexOf("loginid")){
	  		document.getElementById("form").style.visibility = "hidden";
	  		document.getElementById("ta").style.visibility = "visible";

	  		//Get active symbols
	  		ws.send(JSON.stringify({active_symbols:'full'}));
	   	}else{

	   		//Subscribe to active symbols
	   		if(~strresp.indexOf("active_symbols")){
	   			var active_syms = data.active_symbols;
	   		
	   			for (var i = 0; i < active_syms.length; i++) { 
	   				var s = active_syms[i].symbol;
			    	
                 		syms.push(s);
                 		var cp = {"epoch": [], "quote": []};
                 		currency_pairs.push(cp);
                 		ws.send(JSON.stringify({ticks: active_syms[i].symbol}));
				}
				
	   		}else{
	   			if(~strresp.indexOf("epoch")){
	   				if(data.msg_type == "tick"){
	   					process(data);
	   					//alert(JSON.stringify(currency_pairs));
                	}
	   			}else if(~strresp.indexOf("This market is presently closed.")){
	   				//data.echo_req.ticks[0];
	   			}
	   				
	   		}
	   		
	  	}

   }
};

function authenticate(){
	ws.send(JSON.stringify({authorize:'1aStI5HCcty55Ly'}));
}

function process(data){
	
	var epoch = data.tick.epoch;
	var quote = data.tick.quote;
	var sym = data.tick.symbol;
	var i = syms.indexOf(sym);

	currency_pairs[i].epoch.push(epoch);
    currency_pairs[i].quote.push(quote);

    //alert(JSON.stringify(currency_pairs));
}
