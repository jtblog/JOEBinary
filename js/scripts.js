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

var a = 0;
var b = 0;
window.setInterval(ping, 15000);

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
			b++;
	   		process(data);
		}
	   
		if(!(data.active_symbols == null)){
		var atv_syms = data.active_symbols;
			var cb = "";
	   		for (var i = 0; i < atv_syms.length; i++) { 
				var symb = atv_syms[i].symbol.toString();
				if( symb.indexOf("GBPUSD") > -1 || 
					symb.indexOf("EURUSD") > -1 ||
					//symb.indexOf("EURJPY") > -1 || 
					//symb.indexOf("USDJPY") > -1 ||
					symb.indexOf("USDCHF") > -1 ||
					//symb.indexOf("EURGBP") > -1 ||
					//symb.indexOf("EURCHF") > -1 ||
					//symb.indexOf("AUDUSD") > -1 ||
					//symb.indexOf("NZDUSD") > -1 ||
					//symb.indexOf("AUDJPY") > -1 ||
					symb.indexOf("R_") > -1){
						
					cb = cb + '<option value ="' + i + '" >' + symb.toString() + '</option>' + '\n';
					syms.push(symb);
                	var cp = {"symbol" : '' + symb + '', "epochs" : [], "quotes" : [], "v1" : 0.0, "iPeriod1" : 0.0, "cycle" : [], "sine" : [], "leadsine" : []};
                	currency_pairs.push(cp);
				}
	   			
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
	
	//Send to Android device
	sync_tick(sym, epoch, quote);
	///////////
	////////
	
	var i = syms.indexOf(sym);

	while(currency_pairs[i].epochs.length >= 16){
		currency_pairs[i].epochs.shift();
	}
	
	if(currency_pairs[i].epochs.length > 2){
		var curr_min = (new Date((epoch*1000))).getMinutes();
		var prev_min = (new Date((currency_pairs[i].epochs[currency_pairs[i].epochs.length-1] * 1000))).getMinutes();
		if(!(curr_min == prev_min)){
			currency_pairs[i].quotes.push(quote);
		}else{
			currency_pairs[i].quotes[currency_pairs[i].quotes.length - 1] = quote;
		}
	}else{
		
	}
	
	while(currency_pairs[i].quotes.length >= 16){
		currency_pairs[i].quotes.shift();
	}
	//compute_HT_Sine(currency_pairs[i]);
	currency_pairs[i].epochs.push(epoch);
    
	//alert(JSON.stringify(currency_pairs[i].quotes));
	//alert(JSON.stringify(currency_pairs[i]));
}

function compute_HT_Sine(pair){
	
	var quote_closes = pair.quotes;
	var smooth = [];
	var Q1 = [];
	var I1 = [];
	var DeltaPhase = [];
	var MedianDelta = 0.0;
	var DC = 0.0;
	var DCPeriod = 0;
	var DCPhase = 0.0;
		
	var i = 0;
		do{
			smooth[i+3] = ( quote_closes[i] + (2 * quote_closes[i+1]) + (2 * quote_closes[i+2]) + quote_closes[i+3] ) / 6;
			i++;
		}
		while((i+3) < quote_closes.length);

		i= 0;
		if(pair.cycle[pair.cycle.length - 4] != 0){
			do{
				pair.cycle[i+2] = ( quote_closes[i] - (2 * quote_closes[i+2]) + quote_closes[i+2] ) / 4;
				i++;
			}
			while((i+2) < quote_closes.length);
		}else{
			do{
				pair.cycle[i+2] = ( Math.pow(( 1 - 0.5 * alpha ), 2) ) * ( smooth[i+2] - 2 * smooth[i+1] + smooth[i] ) + 2 * ( 1 - alpha ) * pair.cycle[i+1] - ( Math.pow(( 1 - alpha ), 2) ) * pair.cycle[i];
				i++;
			}
			while((i+2) < quote_closes.length);
		}


		//Hilbert Transform
		i = pair.cycle.length - 1;
		do{
			Q1[i] = ( 0.0962 * pair.cycle[i] + 0.5769 * pair.cycle[i-2] - 0.5769 * pair.cycle[i-4] - 0.0962 * pair.cycle[i-6] ) * ( 0.5 + 0.08 * pair.iPeriod1 );
			i--;
		}
		while((i-6) > -1);

		i = pair.cycle.length - 1;
		do{
			I1[i] = pair.cycle[i-3];
			i--;
		}
		while((i-3) > -1);

		i = Q1.length - 1;
		do{
			if ( (Q1[i] != 0) && (Q1[i-1] != 0) ){
				DeltaPhase[i] = ( (I1[i] / Q1[i]) - (I1[i-1] / Q1[i-1]) ) / ( 1 + ( (I1[i] * I1[i-1]) / (Q1[i] * Q1[i-1]) ) );
			}

			if ( DeltaPhase[i] < 0.1 ){
				DeltaPhase[i] = 0.1;
			}

			if ( DeltaPhase[i] > 1.1 ){
				DeltaPhase[i] = 1.1;
			}
			i--;
		}
		while((i-1) > -1);
		
		var l = DeltaPhase.length;
		//MedianDelta = Median(sortarray({DeltaPhase[l-1], DeltaPhase[l-2], DeltaPhase[l-3], DeltaPhase[l-4], DeltaPhase[l-5]});
		if ( MedianDelta == 0 ){
			DC = 15;
		}else{
			DC = (6.28318 / MedianDelta) + 0.5;
		}

		pair.iPeriod1 = (0.33 * DC) + (0.67 * pair.iPeriod1);
		pair.v1 = 0.15 * pair.iPeriod1 + 0.85 * pair.v1;
		DCPeriod = parseInt(pair.v1);

		i = pair.cycle.length - 1;
		var RealPart= 0.0;
		var ImagPart = 0.0;
		do{
			RealPart += Math.sin(deg_to_rad(360 * i / DCPeriod)) * pair.cycle[i];
			ImagPart += Math.cos(deg_to_rad(360 * i / DCPeriod)) * pair.cycle[i];
			i--;
		}while(i>pair.cycle.length - 1 - DCPeriod);

		if ( Math.abs( ImagPart ) > 0.001 ){
			DCPhase = rad_to_deg(Math.atan( RealPart / ImagPart));
		}

		if ( Math.abs( ImagPart ) <= 0.001 ){
			DCPhase = 90 * ( RealPart < 0 ? -1 : 1);
		}
		DCPhase += 90;

		if ( ImagPart < 0 ){
			DCPhase += 180;// add 180
		}
		
		 if(!Double.isNaN(DCPhase)){
			 pair.sine[pair.sine.length - 1] = Math.sin(deg_to_rad(DCPhase));
		 	pair.leadsine[pair.leadsine.length - 1] = Math.sin(deg_to_rad(DCPhase + 45));
		 }
		 
		 smooth = null;
		 Q1 = null;
		 I1 = null;
		 DeltaPhase = null;
		
}

function deg_to_rad(p0){
		return p0 * (Math.PI / 180);
	}

function rad_to_deg(p0){
		return p0 * (180 / Math.PI);
	}

function Median(p0){

		if((p0.length % 2) == 0){
			return ( (p0[(p0.length / 2)]) +
				(p0[((p0.length / 2) - 1)]) ) / 2;
		}else{
			return p0[parseInt(String(((p0.length / 2) - (1/2))))];
		}
	}

function sortarray(p0){

		var swapped = true;
		var j = 0;
		var tmp;
		while (swapped) {
			swapped = false;
			j++;
			for (var i = 0; i < p0.length - j; i++) {
				if (p0[i] > p0[i + 1]) {
					tmp = p0[i];
					p0[i] = p0[i + 1];
					p0[i + 1] = tmp;
					swapped = true;
				}
			}
		}

		return p0;
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

function ping(){
	if(a == b){
		ws_bin.send('{"ping": 1}');
	}
}

function sync_tick(symbol, epoch, quote){
	//var d = new Date((epoch*1000));
	//alert(quote);
	Android.tick(symbol, epoch, quote);
	a = b;
}
