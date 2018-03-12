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
		// $('#details').show();
		
	    // alert( table.cell( this ).data() );
	    // alert(table.cell( $(this).closest('tr'), 0 ).data());

	   	var lo = table.cell( $(this).closest('tr'), 2 ).data();		//Low 
		// var hi = table.cell( $(this).closest('tr'), 3 ).data();		//Hi market
		// var coin = table.cell( $(this).closest('tr'), 0 ).data();
	    $.ajax({
						type: 'POST',
						// data: JSON.stringify(lo),
						data: lo,
				        // contentType: 'application/json',
				        contentType: 'text/html',
                        url: 'http://localhost:8001',						
                        success: function(data) {
                            console.log('success');
                            console.log(data);
                        }
                    });

	});


	$('#x').on('click', function() {
		$('#details').hide();
	});



	//Listen for msg
	socket.on('data', function(msg){
		// console.log(msg);
		$('#example').dataTable().fnClearTable();
		$('#example').dataTable().fnAddData(msg);

		// $('#example').dataTable().fnUpdate(msg, 0, 1 );
			// Sort by column 1 and then re-draw
		// table
		//     .order( [ 1, 'desc' ] )
		//     .draw();

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

