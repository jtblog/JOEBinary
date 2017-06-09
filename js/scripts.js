/*
$.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
    	options.crossDomain ={
    		crossDomain: true
  		};
  		
    	//options.xhrFields = {
    		//withCredentials: true
  		//};
  		
        options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    }
});
*/

document.getElementById("ta").style.visibility = "hidden";
var ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3956');
var btoken = document.getElementById("_login-input0").value;
var syms = [];
var currency_pairs = [];
//var d = new Date(1496610240);
//alert(d.toString());

//document.domain = 'https://billing.iqoption.com';
/*
$.ajax({
  type: "POST",
  url: 'https://iqoption.com/api/login',
  crossDomain: true,
  //header: {'Access-Control-Allow-Origin': 'https://billing.iqoption.com'},
  data: {"email": "jtob91@yahoo.com", "password": "06143460AI"},
  	success: function( data ) {
  		//alert(JSON.stringify(document.cookie));
  		//$( ".result" ).html( data );
	},
	error: function( data ) {
  		//alert(JSON.stringify(data));
	},
  dataType: "jsonp"
}).done(function (data, textStatus, xhr) { 
    alert(JSON.stringify(xhr.getAllResponseHeaders())); 
    //if(~(JSON.stringify(xhr.getAllResponseHeader()).indexOf("ssid")))
    //	alert('');
});;
*/


ws.onopen = function(evt) {
	                                                                                                                
};

ws.onmessage = function(msg) {
   var data = JSON.parse(msg.data);
   
   var strresp = JSON.stringify(data);
   
   if(~strresp.indexOf("The token is invalid")){
	   	document.getElementById("form").style.visibility = "visible";
		document.getElementById("ta").style.visibility = "hidden";
		alert("Invalid tokin: " + btoken);
   }else{
   		
	  	if(~strresp.indexOf("loginid")){
	  		//Logged In
	  		document.getElementById("form").style.visibility = "hidden";
	  		document.getElementById("ta").style.visibility = "visible";

	  		//Get active symbols
	  		ws.send(JSON.stringify({active_symbols:'full'}));
	   	}else{

	   		//Subscribe to active symbols
	   		if(~strresp.indexOf("active_symbols")){
	   			var active_syms = data.active_symbols;
	   		
	   			var cb = "";
	   			for (var i = 0; i < active_syms.length; i++) { 
	   					//if(active_syms[i].symbol.toString().match(/\d+/g) == null){
	   						cb = cb + '<option value ="' + i + '" selected=false >' + active_syms[i].symbol.toString() + '</option>' + '\n';
	   					//}

                 		syms.push(active_syms[i].symbol);
                 		var cp = {"epoch": [], "quote": []};
                 		currency_pairs.push(cp);
                 		ws.send(JSON.stringify({ticks: active_syms[i].symbol}));
				}
						document.getElementById("select_pair").innerHTML = cb;

	   		}else{
	   			if(~strresp.indexOf("epoch")){
	   				if(data.msg_type == "tick"){
	   					process(data);
                	}
	   			}else if(~strresp.indexOf("This market is presently closed.")){
	   				//data.echo_req.ticks[0];
	   			}
	   				
	   		}
	   		
	  	}

   }
};

function authenticate(){
	//ws.send(JSON.stringify({authorize: btoken}));
	showAndroidToast(btoken);
}

function process(data){
	
	var epoch = data.tick.epoch;
	var quote = data.tick.quote;
	var sym = data.tick.symbol;
	var i = syms.indexOf(sym);

	//if()

	currency_pairs[i].epoch.push(epoch);
    currency_pairs[i].quote.push(quote);
}

function onChanged(event){
        var user_options = document.getElementById("select_pair");
        var selected_option = user_options.options[user_options.selectedIndex].text;
        //alert(selected_option);
	}
	
function showAndroidToast(toast) {
    Android.showToast(toast);
}
