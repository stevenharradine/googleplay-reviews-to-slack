fs = require('fs')
https = require("https")

const useStubbedResponse = false;
var html;
var google_play_id = process.argv[2]

if (useStubbedResponse) {
	fs.readFile(google_play_id + '.stub', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err)
	  }
	  processDOM (data)
	})
} else {
	var options = {
	  host: 'play.google.com',
	  port: 443,
	  path: '/store/apps/details?id=' + google_play_id
	}
	var req = https.get(options, function(res) {
		var content = ""

	    res.setEncoding("utf8")
	    res.on("data", function (chunk) {
	        content += chunk
	    });

	    res.on("end", function () {
	        processDOM (content)
	    });
	}).on('error', function(e) {
	  console.log("Got error: " + e.message)
	});
	req.end()	
}

function processDOM (dom) {
	console.log (dom);
}
