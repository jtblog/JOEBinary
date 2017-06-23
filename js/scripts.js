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

var ws_bin = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=3956');
//var ws_iqoption = new WebSocket('wss://eu.iqoption.com/echo/websocket');

var syms = [];

var currency_pairs = [];

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

ws_bin.onopen = function(evt) {
	
};

ws_bin.onmessage = function(msg) {
   var data = JSON.parse(msg.data);
   var strresp = JSON.stringify(data);
   
   if(!(data.error == null)){
	   var err = data.error;
	   
	   	document.getElementById("form").style.visibility = "visible";
		document.getElementById("ta").style.visibility = "hidden";
		
		//alert(data.error.message);
		showAndroidToast(data.error.message);
   }else{
	   
	   	if(!(data.tick == null)){
			//alert(strresp);
	   		process(data);
		}
	   
		if(!(data.active_symbols == null)){
		var atv_syms = data.active_symbols;
			var cb = "";
	   		for (var i = 0; i < atv_syms.length; i++) { 
	   			cb = cb + '<option value ="' + i + '" >' + atv_syms[i].symbol.toString() + '</option>' + '\n';
				syms.push(atv_syms[i].symbol);
                var cp = {"symbol" : '' + atv_syms[i].symbol + '', "epoch" : [], "quote" : []};
                currency_pairs.push(cp);
			}
		
		ws_bin.send('{"ticks" : ' + JSON.stringify(syms) + '}');
		document.getElementById("select_pair").innerHTML = cb;

		}else{
			var lid = data.authorize.loginid;
   			if(!(lid == null)){
	   			ws_bin.send('{"active_symbols" : "brief"}');
				$('#form').remove();
	  			document.getElementById("ta").style.visibility = "visible";
			}
		}
		
   }
   
};

function authenticate(){
	var btoken = document.getElementById("_login-input0").value;
	if(btoken != ""){
		var msg = '{"authorize" : "' + btoken + '"}';
		ws_bin.send(msg);
	}else{
		alert('Empty token!!!');
		showAndroidToast('Empty token!!!');
	}
	
}

function process(data){
	
	var epoch = data.tick.epoch;
	var quote = data.tick.quote;
	var sym = data.tick.symbol;
	sync_tick(sym, epoch, quote);
	var i = syms.indexOf(sym);

	currency_pairs[i].epoch.push(epoch);
    currency_pairs[i].quote.push(quote);
	//alert(JSON.stringify(currency_pairs[i]));
}

function onChanged(event){
        var user_options = document.getElementById("select_pair");
        var selected_option = user_options.options[user_options.selectedIndex].text;
		Android.selected_symbol(selected_option);
        //alert(selected_option);
	}
	
function showAndroidToast(toast) {
    Android.showToast(toast);
}

function sync_tick(symbol, epoch, quote){
	//var d = new Date((epoch*1000));
	//alert(quote);
	Android.tick(symbol, epoch, quote);
	ws_bin.send('{"ping": 1}');
}
