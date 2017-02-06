fs = require('fs')
https = require("https")
cheerio = require('cheerio')

const useStubbedResponse = true;
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
	$ = cheerio.load(dom)
	var reviews = $('.single-review')



	reviews.each (function (index, element) {
		name = $(element).find(".author-name").text().trim()
		date = $(element).find(".review-date").text().trim()
		stars = $(element).find(".star-rating-non-editable-container").attr("aria-label").trim()
		review = $(element).find(".review-body").text().trim()

		console.log (name + "(" + date + ")")
		console.log (stars)
		console.log (review.replace("Full Review", ""))
		console.log ()
	})
}
