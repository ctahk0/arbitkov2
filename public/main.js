$(document).ready(function() {
	//Make connection
	// var socket = io.connect("http://localhost:8001");
	$('#details').hide();
	var socket = io();

	$('#example').dataTable( {
				"language": {
		            "decimal": ",",
		            "thousands": "."
		        },
		        stateSave: true,
		        "iDisplayLength": 100,
			    scrollY: 550,
			    "scrollX": true,
    			// paging: false,
		    	// "aaData": msg,
		    	"processing":true,
		    	"columnDefs": [
				    { "sClass": "dt-body-right", "targets": [ 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19 ] }
				  ],
		    	"aoColumns": [
				      { "sTitle": "Symbol",   "mData": "coin","defaultContent": ""  },
				      { "sTitle": "Profit %",  "mData": "razlika","defaultContent": "" },
				      { "sTitle": "Lo", "mData": "Lo","defaultContent": ""  },
				      { "sTitle": "Hi",  "mData": "Hi","defaultContent": ""  },
				      { "sTitle": "Binance Ask",  "mData": "BinAsk","defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "BinBid","defaultContent": ""  },
				      { "sTitle": "Kucoin Ask",  "mData": "KucoinAsk", "defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "KucoinBid","defaultContent": ""  },
				      { "sTitle": "Hitbtc Ask",  "mData": "HitbtcAsk", "defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "HitbtcBid","defaultContent": ""  },
				      { "sTitle": "Poloniex Ask",  "mData": "PolAsk", "defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "PolBid","defaultContent": ""  },
				      { "sTitle": "Bitfinex Ask",  "mData": "BfAsk","defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "BfBid","defaultContent": ""   },
				      { "sTitle": "Bittrex Ask",  "mData": "BittrAsk","defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "BittrBid","defaultContent": ""   },
				  	  { "sTitle": "Kraken Ask",  "mData": "KrakenAsk", "defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "KrakenBid","defaultContent": ""  },
				      { "sTitle": "Okex Ask",  "mData": "OkexAsk", "defaultContent": "" },
				      { "sTitle": "Bid",  "mData": "OkexBid","defaultContent": ""  }

		    	]
	});

	var table = $('#example').DataTable();
	 
	//selekcija u tabeli
	$('#example tbody').on( 'click', 'tr', function () {
	        if ( $(this).hasClass('selected') ) {
	            $(this).removeClass('selected');
	        }
	        else {
	            table.$('tr.selected').removeClass('selected');
	            $(this).addClass('selected');
	        }
	    });

	//ajax za dodatni info o izabranom paru
	$('#example tbody').on( 'click', 'td', function () {
		$('#details').show();
		
	    // alert( table.cell( this ).data() );
	    // alert(table.cell( $(this).closest('tr'), 0 ).data());

	   	var lo = table.cell( $(this).closest('tr'), 2 ).data();		//Low 
		var hi = table.cell( $(this).closest('tr'), 3 ).data();		//Hi market
		var coin = table.cell( $(this).closest('tr'), 0 ).data();
		var markets = {
			lo: lo,
			hi: hi,
			coin: coin
		};
		// console.log(markets);
	    $.ajax({
						type: 'POST',
						// data: JSON.stringify(lo),
						data: JSON.stringify(markets),
					    contentType: "application/json; charset=utf-8",
					    dataType: "json",
                        url: 'http://clockwellsoftware.xyz:8001/',						
                        success: function(data) {
                            console.log("success");
                            // console.log("Ovo je iz klijenta", data);
                        }
                    });

	});


	$('#x').on('click', function() {
		$('#details').hide();
	});



	//Listen for msg
	socket.on('data', function(msg){
		//console.log(msg);
		$('#example').dataTable().fnClearTable();
		$('#example').dataTable().fnAddData(msg);

		// $('#example').dataTable().fnUpdate(msg, 0, 1 );
			// Sort by column 1 and then re-draw
		// table
		//     .order( [ 1, 'desc' ] )
		//     .draw();

	});

	socket.on('datadetails', function(msg){
		console.log(msg[0]);
		// console.log(msg[0][0]);
		var tbody = document.getElementById('task');
		// var th = "";
		tbody.innerHTML = "";
		var tr = "<tr>";
		var total =0;
		for (let n in msg[1]){
			let price = ((msg[1][n].price)*1000).toFixed(4); 
			let qty = msg[1][n].qty;
			let amount = msg[1][n].amount;
			total += amount;
			tr += "<td>" + price + "</td><td>" + qty.toFixed(3) + "</td><td>" + amount.toFixed(4) + "</td></tr>";

			// console.log(msg[1][n].price);
		}
		tr += "<td></td><td>TOTAL First (15)</td><td><strong>" + total.toFixed(3) + "</td></tr>";
		tbody.innerHTML += tr;


		var tbody1 = document.getElementById('tbid');
		// var th = "";
		tbody1.innerHTML = "";
		var tr1 = "<tr>";
		var total1 =0;
		for (let n in msg[2]){
			let price = ((msg[2][n].price)*1000).toFixed(4); 
			let qty = msg[2][n].qty;
			let amount = msg[2][n].amount;
			total1 += amount;
			tr1 += "<td>" + price + "</td><td>" + qty.toFixed(3) + "</td><td>" + amount.toFixed(4) + "</td></tr>";

			//console.log(msg[1][n].price);
		}
		tr1 += "<td></td><td>TOTAL First (15)</td><td><strong>" + total1.toFixed(3) + "</td></tr>";
		tbody1.innerHTML += tr1;
		var asc = document.getElementById('askcap');
		var bdc = document.getElementById('bidcap');
		var obj = msg[0];
		asc.innerHTML = "";
		bdc.innerHTML = "";
		if (typeof obj[0] != 'undefined') {
			console.log("lo", obj[0].lo);
			console.log("ask qty", obj[0].askqty);
			console.log("ask price", obj[0].avgprice*1000);
			asc.innerHTML += "<strong>" + obj[0].lo;
			asc.innerHTML += ", Qty <strong>" + obj[0].askqty.toFixed(3);
			asc.innerHTML += ", Avg price: <strong>" + (obj[0].avgprice*1000).toFixed(4) + "</strong>";
		}
		if (typeof obj[1] != 'undefined') {
			console.log("hi", obj[1].hi);
			console.log("bid qty", obj[1].bidqty);
			console.log("bid price", obj[1].avgprice*1000);
			bdc.innerHTML += "<strong>" + obj[1].hi;
			bdc.innerHTML += ", Qty <strong>" + obj[1].bidqty.toFixed(3);
			bdc.innerHTML += ", Avg price: <strong>" + (obj[1].avgprice*1000).toFixed(4) + "</strong>";
		}
		// $('#askcap').html(msg[0][0]);
		// $('#bidcap').html(msg[0][1]);

	});


});




// refreshTable.on('field', function (data) {
// console.log(data);

// oTable.fnClearTable();
// oTable.fnAddData(data);
// oTable.fnUpdate( data, 0, 1 );// need to use fnUpdate on all columns/rows

// });

// var dataSet = 
//    [
//     {
//       "name": "Tiger Nixon",
//       "position": "System Architect",
//       "salary": "$320,800",
//       "start_date": "2011/04/25",
//       "office": "Edinburgh",
//       "extn": "5421"
//     },
//     {
//       "name": "Garrett Winters",
//       "position": "Accountant",
//       "salary": "$170,750",
//       "start_date": "2011/07/25",
//       "office": "Tokyo",
//       "extn": "8422"
//     }
//   ]

