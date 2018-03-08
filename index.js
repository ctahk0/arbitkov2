var express = require('express');
var socket = require('socket.io');
var axios = require('axios');

//App setup
var app = express();
var server = app.listen(8000, function(){
	console.log("Server listening on port 8000");
});

//Static files
app.use(express.static(__dirname + '/public'));
// app.use(express.static('public'));

//Socket setup
var io = socket(server);

io.on('connection', function(socket){
	console.log("Coneection open");
	
	// getprices(function(returnval) {
	// 	// console.log(returnval);
	// 	io.emit('data',returnval);
	// });

	// io.emit('data',"Emitujem!");
});

setInterval(function(){
	getprices(function(returnval) {
		io.emit('data',returnval);
	});
}, 10000)

async function getprices(callback){
	var coins = {};			//niz coina za lastprice
	var askarr = {};		//Ask prices array
	var bidarr = {};		//Bid prices array
	var arrcryptopia = [];
	var arrpoloniex = [];
	var arrbitfinex = [];
	var arrbinance = [];
	var arrbittrex = [];
	var val;				//trenutna valuta koju punimo sa lastprice

	try {
    	// then we grab some data over an Ajax request
    	const cryptopiaInfo = await axios ('https://www.cryptopia.co.nz/api/GetCurrencies');
    	const bitfinex = await axios('https://api.bitfinex.com/v2/tickers?symbols=tBTCUSD,tLTCBTC,tETHBTC,tETCBTC,tRRTBTC,tZECBTC,tXMRBTC,tDSHBTC,tBTCEUR,tXRPBTC,tIOTBTC,tEOSBTC,tSANBTC,tOMGBTC,tBCHBTC,tNEOBTC,tETPBTC,tQTMBTC,tAVTBTC,tEDOBTC,tBTGBTC,tDATBTC,tQSHBTC,tYYWBTC,tGNTBTC,tSNTBTC,tBATBTC,tMNABTC,tFUNBTC,tZRXBTC,tTNBBTC,tSPKBTC,tTRXBTC,tRCNBTC,tRLCBTC,tAIDBTC,tSNGBTC,tREPBTC,tELFBTC');
    	const cryptopiaBTC = await axios('https://www.cryptopia.co.nz/api/GetMarkets/BTC');
    	const poloniexBTC = await axios('https://poloniex.com/public?command=returnTicker');
    	const poloniexInfo = await axios('https://poloniex.com/public?command=returnCurrencies');
    	const binance = await axios('https://api.binance.com/api/v3/ticker/price');
    	const binanceInfo = await axios('https://www.binance.com/exchange/public/product');
    	const binancePrices = await axios('https://api.binance.com/api/v3/ticker/bookTicker');
    	const bittrex = await axios('https://bittrex.com/api/v1.1/public/getmarketsummaries');

    	var obj_cryptopia_status = cryptopiaInfo.data.Data;
    	var obj_cryptopia = cryptopiaBTC.data.Data;
    	var obj_poloniex = poloniexBTC.data;
    	var obj_poloniexInfo = poloniexInfo.data;
    	var obj_binanceInfo = binanceInfo.data.data;
    	//======================== Binance ==============================================================
    	for (let key in obj_binanceInfo) {
    		if(obj_binanceInfo[key].symbol.includes('BTC')) {
    			// console.log(obj_binanceInfo[key].symbol, obj_binanceInfo[key].baseAssetName);
    			let coinName = obj_binanceInfo[key].symbol.replace("BTC", '');
    			arrbinance.push({
					symbol: coinName,
					name: obj_binanceInfo[key].baseAssetName,
					active: obj_binanceInfo[key].active,
					status: obj_binanceInfo[key].status
				});
    		}
    	}
    	// console.log(arrbinance);
    	for (let key in binance.data) {
    		if(binance.data[key].symbol.includes('BTC')) {
    			let coinName = binance.data[key].symbol.replace("BTC", '');
            	let last = (binance.data[key].price * 1000);
            	
            	for (let n = 0; n < arrbinance.length; n++) {

					if (arrbinance[n].symbol == coinName) {
						arrbinance[n].lastprice = last
					}
				}

				/*if (typeof coins[coinName] == "undefined") {
	            	coins[coinName] = {};
	            }
	            coins[coinName].Binance = last;*/
            }
    	}

    	for (var key in binancePrices.data) {
    		if(binancePrices.data[key].symbol.includes('BTC')) {
    			let coinName = binancePrices.data[key].symbol.replace("BTC", '');
            	let ask = (binancePrices.data[key].askPrice * 1000);
            	let bid = (binancePrices.data[key].bidPrice * 1000);
            	let buyvolume = Number(binancePrices.data[key].askQty).formatMoney(2, '.', ',');
            	let sellvolume = Number(binancePrices.data[key].bidQty).formatMoney(2, '.', ',');
            	
            	for (let n = 0; n < arrbinance.length; n++) {

					if (arrbinance[n].symbol == coinName) {
						arrbinance[n].askprice = Number(ask.toFixed(5)),
						arrbinance[n].bidprice = Number(bid.toFixed(5)),
						arrbinance[n].buyvolume = buyvolume,
						arrbinance[n].sellvolume = sellvolume
					}
				}
				//punimo 2 niza,
				//askarr i bidarr
				if (typeof askarr[coinName] == "undefined") {
	            	askarr[coinName] = {};
	            }
	            if (typeof bidarr[coinName] == "undefined") {
	            	bidarr[coinName] = {};
	            }
	            askarr[coinName].Binance = ask;
	            bidarr[coinName].Binance = bid;
            }
    	}

    	//======================== Poloniex =============================================================
    	for (let key in obj_poloniex) {
    		for (let n in obj_poloniexInfo) {
	    		if( key.replace("BTC_", '') == n) {
	                let coinName = key.replace("BTC_", '');
	                let last = (obj_poloniex[key].last * 1000);
	    			let ask = (obj_poloniex[key].lowestAsk * 1000);
	    			let bid = (obj_poloniex[key].highestBid * 1000);
	    			// var buyvolume = (obj_poloniex[key].BuyVolume).formatMoney(2, '.', ',');
	    			// var sellvolume = (obj_poloniex[key].SellVolume).formatMoney(2, '.', ',');
	    			if ( (obj_poloniexInfo[n].disabled == '0') && (obj_poloniexInfo[n].delisted == '0') && (obj_poloniexInfo[n].frozen = '0')) {

	    				arrpoloniex.push({
				  			id: obj_poloniexInfo[n].id,
				  			symbol: coinName,
				  			name: obj_poloniexInfo[n].name,
				  			disabled: obj_poloniexInfo[n].disabled,
				  			delisted: obj_poloniexInfo[n].delisted, 
				  			frozen: obj_poloniexInfo[n].frozen,
				  			lastprice: last,
				  			askprice: Number(ask.toFixed(5)),
				  			bidprice: Number(bid.toFixed(5))
				  		});
					//punimo 2 niza,
					//askarr i bidarr
					if (typeof askarr[coinName] == "undefined") {
		            	askarr[coinName] = {};
		            }
		            if (typeof bidarr[coinName] == "undefined") {
		            	bidarr[coinName] = {};
		            }
		            askarr[coinName].Poloniex = ask;
		            bidarr[coinName].Poloniex = bid;
		          }
	            }	
           }
    	}
    	//======================== Bitfinex =============================================================
											    // SYMBOL,
											    // BID, 
											    // BID_SIZE, 
											    // ASK, 
											    // ASK_SIZE, 
											    // DAILY_CHANGE, 
											    // DAILY_CHANGE_PERC, 
											    // LAST_PRICE, 
											    // VOLUME, 
											    // HIGH, 
											    // LOW
    	for (let key in bitfinex.data) {
        	let cn = bitfinex.data[key][0].replace("BTC", '');
            let coinName = cn.substr(1);  //remove first character 't'
                if (coinName === "IOT") {
                      coinName = "IOTA";
                }
            let bf_last = (bitfinex.data[key][7] * 1000);
            let ask = (bitfinex.data[key][3] * 1000);
            let bid = (bitfinex.data[key][1] * 1000);
            let buyvolume = (bitfinex.data[key][4]).formatMoney(2, '.', ',');
	    	let sellvolume = (bitfinex.data[key][2]).formatMoney(2, '.', ',');
            // ovdje punimo bitfinex
            arrbitfinex.push({
            	symbol : coinName,
            	lastprice : bf_last,
            	askprice : Number(ask.toFixed(5)),
            	bidprice : Number(bid.toFixed(5)),
            	buyvolume : buyvolume,
            	sellvolume : sellvolume
            });
			//punimo 2 niza,
			//askarr i bidarr
			if (typeof askarr[coinName] == "undefined") {
		           askarr[coinName] = {};
		    }
		    if (typeof bidarr[coinName] == "undefined") {
		           	bidarr[coinName] = {};
		    }
		    askarr[coinName].Bitfinex = ask;
		    bidarr[coinName].Bitfinex = bid;

    	}
    	
    	//======================== Cryptopia =============================================================
    	for (let c in obj_cryptopia) {
    		//kreiraj niz
    		for (let n in obj_cryptopia_status) {
    			//let symstr = obj_cryptopia[c].Label;
    			//let sym = symstr.replace('/BTC','');
    			if (obj_cryptopia[c].Label.replace('/BTC','') == obj_cryptopia_status[n].Symbol) {
    				let cr_last = (obj_cryptopia[c].LastPrice * 1000);	//.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    				let ask = (obj_cryptopia[c].AskPrice * 1000);
    				let bid = (obj_cryptopia[c].BidPrice * 1000);
    				let buyvolume = (obj_cryptopia[c].BuyVolume).formatMoney(2, '.', ',');
    				let sellvolume = (obj_cryptopia[c].SellVolume).formatMoney(2, '.', ',');
    				arrcryptopia.push({
			  			id: obj_cryptopia_status[n].Id,
			  			symbol: obj_cryptopia_status[n].Symbol,
			  			name: obj_cryptopia_status[n].Name,
			  			status: obj_cryptopia_status[n].Status,
			  			listingstatus: obj_cryptopia_status[n].ListingStatus, 
			  			message: obj_cryptopia_status[n].StatusMessage,
			  			lastprice: cr_last,
			  			askprice: Number(ask.toFixed(5)),
			  			bidprice: Number(bid.toFixed(5)),
			  			buyvolume: buyvolume,
			  			sellvolume: sellvolume
			  		});

					let coinName = obj_cryptopia_status[n].Symbol;
					if (coinName != 'BAT' && coinName != 'BTG' && coinName != 'BLZ' && coinName != 'FUEL'){
						if (obj_cryptopia_status[n].Status == 'OK' 
							&& obj_cryptopia_status[n].ListingStatus == 'Active') {
							
							if (typeof askarr[coinName] == "undefined") {
						           askarr[coinName] = {};
						    }
						    if (typeof bidarr[coinName] == "undefined") {
						           	bidarr[coinName] = {};
						    }
						    askarr[coinName].Cryptopia = ask;
						    bidarr[coinName].Cryptopia = bid;
						}

					}
		  		}	
    		}
    	}
    	//======================== Bittrex =============================================================

							  // "success": true,
							  // "message": "",
							  // "result": [
							  //   {
							  //     "MarketName": "BTC-1ST",
							  //     "High": 0.00003380,
							  //     "Low": 0.00002722,
							  //     "Volume": 3826433.79514019,
							  //     "Last": 0.00002786,
							  //     "BaseVolume": 114.16326003,
							  //     "TimeStamp": "2018-03-08T17:01:38.163",
							  //     "Bid": 0.00002765,
							  //     "Ask": 0.00002783,
							  //     "OpenBuyOrders": 136,
							  //     "OpenSellOrders": 2031,
							  //     "PrevDay": 0.00002989,
							  //     "Created": "2017-06-06T01:22:35.727"
		for (let obj of bittrex.data.result) {
			// console.log(obj);
			// console.log(obj["MarketName"]);
        	if(obj["MarketName"].includes('BTC-')) {
            	let coinName = obj["MarketName"].replace("BTC-", '');
				let last = obj.Last;
				let ask = (obj.Ask * 1000);
            	let bid = (obj.Bid * 1000);
            	let buyvolume = obj.OpenBuyOrders;		//Ovo provjeriti sta je
	    		let sellvolume = obj.OpenSellOrders;
	    		            // ovdje punimo bittrex
	            arrbittrex.push({
	            	symbol : coinName,
	            	lastprice : last,
	            	askprice : Number(ask.toFixed(5)),
	            	bidprice : Number(bid.toFixed(5)),
	            	buyvolume : buyvolume,			//provjeriti buy i sell volume
	            	sellvolume : sellvolume
	            });
				//punimo 2 niza,
				//askarr i bidarr
				if (typeof askarr[coinName] == "undefined") {
			           askarr[coinName] = {};
			    }
			    if (typeof bidarr[coinName] == "undefined") {
			           	bidarr[coinName] = {};
			    }
			    askarr[coinName].Bittrex = ask;
			    bidarr[coinName].Bittrex = bid;
            }
        }

    	
    	//===================================================================================================

    	// coins["ETH"].Stanko = 455.21;								//ovo radi ovako!
    	//vrtimo nizove, trazimo minimum i maksimum
    	// console.log(askarr);
    	for (let coin in askarr){
			let min = 10000000;
			let max = 0;
			let mmin;
			let mmax;
				obj = askarr[coin];
			  for (let i in obj){
			   	if (obj[i] < min) {min = obj[i]; mmin = i;}
			   	if (obj[i] > max) {max = obj[i]; mmax = i;}
			  }

			  askarr[coin].Min = min;
			  // askarr[coin].Max = max;
			  askarr[coin].MarkMin = mmin;
			  // askarr[coin].MarkMax = mmax;
			  // askarr[coin].Razlika = (((max / min)-1)*100).toPrecision(3);

		}
		for (let coin in bidarr){
			let min = 10000000;
			let max = 0;
			let mmin;
			let mmax;
				obj = bidarr[coin];
			  for (let i in obj){

			   	if (obj[i] < min) {min = obj[i]; mmin = i;}
			   	if (obj[i] > max) {max = obj[i]; mmax = i;}
			  }
			  // bidarr[coin].Min = min;
			  bidarr[coin].Max = max;
			  // bidarr[coin].MarkMin = mmin;
			  bidarr[coin].MarkMax = mmax;
			  // bidarr[coin].Razlika = (((max / min)-1)*100).toPrecision(3);

		}
	

    	//brisemo ako nema niakve razlike
    	//console.log(coins);

    	//Brisanje cemo odloziti privremeno
/*    	for (var key in coins) {
		    if (isNaN(coins[key].Razlika) || coins[key].Razlika == 0) {	
		        delete coins[key];
		    }
		} */

		//sortiranje i novi niz
		var arr = [];
		for (var key in askarr) {
			// console.log(coins[key][0].ask);					//ukrstiti ask i bid niz po coinu
			if (key != 'EUR' && key != 'USD' && key != 'USDT') {	//privremeno izbacujem USD EUR, ne prikazuje kako treba... treba istraziti
				for (var n in bidarr) {
					if (n == key) {
						let razlika = Number((((bidarr[n].Max / askarr[key].Min)-1) * 100).toFixed(3));
						// razlika = Number(roundTo(razlika, 3));
						// console.log(razlika, ' ', typeof razlika);
						if (askarr[key].MarkMin != bidarr[n].MarkMax) {
							arr.push([key, 
				    			razlika, 
				    			askarr[key].MarkMin,
					  			bidarr[n].MarkMax
		    				]);
						}
					}
				}
			}
		}

		
		var results = [];
		for (let i = 0; i < arr.length; i++) { 
			results.push({
						 	coin: arr[i][0],
						 	razlika: arr[i][1],
						 	Lo: arr[i][2],
						 	Hi: arr[i][3]
			});
		}
		for (let i = 0; i < arr.length; i++) {
			for (let n = 0; n < arrcryptopia.length; n++) {
				// console.log(arrcryptopia[n].symbol);
				if (arr[i][0] == arrcryptopia[n].symbol) {
					results[i].Cryptopia = arrcryptopia[n].lastprice;
					results[i].CrName = arrcryptopia[n].name;
					results[i].CrStatus  = arrcryptopia[n].status;
					results[i].CrListingStatus  = arrcryptopia[n].listingstatus;
					results[i].CrMessage = arrcryptopia[n].message;
					results[i].CrAsk = arrcryptopia[n].askprice;
					results[i].CrBid = arrcryptopia[n].bidprice;
					results[i].CrBuyVol = arrcryptopia[n].buyvolume;
					results[i].CrSellVol = arrcryptopia[n].sellvolume;
				}
			}

		}

		for (let i = 0; i < results.length; i++) {
			for (let n = 0; n < arrpoloniex.length; n++) {
				// console.log(results[i].coin , '|' , arrpoloniex[n].symbol);
				if (results[i].coin == arrpoloniex[n].symbol) {
					results[i].Poloniex = arrpoloniex[n].lastprice;
					results[i].PolName = arrpoloniex[n].name;
					results[i].disabled  = arrpoloniex[n].disabled;
					results[i].delisted  = arrpoloniex[n].delisted;
					results[i].frozen = arrpoloniex[n].frozen;
					results[i].PolAsk = arrpoloniex[n].askprice;
					results[i].PolBid = arrpoloniex[n].bidprice;
				}

			}
		}
		for (let i = 0; i < results.length; i++) {
			for (let n = 0; n < arrbitfinex.length; n++) {
				if (results[i].coin == arrbitfinex[n].symbol) {
					results[i].Bitfinex = arrbitfinex[n].lastprice;
					results[i].BfAsk = arrbitfinex[n].askprice;
					results[i].BfBid = arrbitfinex[n].bidprice;
					results[i].BfBuyVol = arrbitfinex[n].buyvolume;
					results[i].BfSellVol = arrbitfinex[n].sellvolume;
				}

			}
		}
		for (let i = 0; i < results.length; i++) {
			for (let n = 0; n < arrbinance.length; n++) {
				if (results[i].coin == arrbinance[n].symbol) {
					results[i].BinSymbol = arrbinance[n].symbol;
					results[i].BinName = arrbinance[n].name;
					results[i].Binance = arrbinance[n].lastprice;
					results[i].BinActive = arrbinance[n].active;
					results[i].BinStatus = arrbinance[n].status;
					results[i].BinAsk = arrbinance[n].askprice;
					results[i].BinBid = arrbinance[n].bidprice;
					results[i].BinBuyVol = arrbinance[n].buyvolume;
					results[i].BinSellVol = arrbinance[n].sellvolume;
				}

			}
		}
		for (let i = 0; i < arr.length; i++) {
			for (let n = 0; n < arrbittrex.length; n++) {
				// console.log(arrbittrex[n].symbol);
				if (arr[i][0] == arrbittrex[n].symbol) {
					results[i].BittrSymbol = arrbittrex[n].symbol;
					results[i].Bittrex = arrbittrex[n].lastprice;
					results[i].BittrAsk = arrbittrex[n].askprice;
					results[i].BittrBid = arrbittrex[n].bidprice;
					results[i].BittrBuyVol = arrbittrex[n].buyvolume;
					results[i].BittrSellVol = arrbittrex[n].sellvolume;
				}
			}

		}
		// console.log(results);
	  	// res.render('index', {results: results});
	  	// return results;
	  	callback(results);
	}
	catch (e) {
	    console.error(e); // 💩
	}

};

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };


  function roundTo(n, digits) {
 		var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
		if( n < 0) {
    	negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {    
    	n = (n * -1).toFixed(2);
    }
    return n;
}