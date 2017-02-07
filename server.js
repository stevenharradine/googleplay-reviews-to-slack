fs = require('fs')
https = require("https")
cheerio = require('cheerio')
Slack = require('slack-node')

const useStubbedResponse = false;

var google_play_id = process.argv[2]
var slack_token = process.argv[3];
var slack_channel = process.argv[4];

webhookUri = "https://hooks.slack.com/services/" + slack_token;
slack = new Slack();
slack.setWebhook(webhookUri);

if (useStubbedResponse) {
	fs.readFile(google_play_id + '.stub', 'utf8', function (err,data) {
	  if (err) return console.log(err)
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

	        // save stubbed response
			fs.writeFile(google_play_id + '.stub', content, function(err) {
		    	if(err) return console.log(err)
			})
	    });
	}).on('error', function(e) {
	  console.log("Got error: " + e.message)
	});
	req.end()
}

function processDOM (dom) {
	$ = cheerio.load(dom)
	var reviews = $('.single-review')

	var new_json =  {}
	    new_json.data = []

	if (fs.existsSync(google_play_id + '.json')) {
		existing_json = JSON.parse(fs.readFileSync(google_play_id + '.json', 'utf8'));
	} else {
		existing_json = {}
		existing_json.data = []
	}

	reviews.each (function (index, element) {
		var isFound = false;

		name = cleanData ($(element).find(".author-name").text())
		date = cleanData ($(element).find(".review-date").text())
		stars = cleanData ($(element).find(".star-rating-non-editable-container").attr("aria-label"))
		review = cleanData ($(element).find(".review-body").text()).replaceAll ("Full Review", "")

		// does the record exisit
		for (var i = 0; i < existing_json.data.length; i++) {
			if (existing_json.data[i].name == name && existing_json.data[i].date == date && existing_json.data[i].review == review) {
				isFound = true
			}
	 	}

	 	// new record found
		if (!isFound) {
			current_record = {}

			current_record.name = name
			current_record.date = date
			current_record.stars = stars
			current_record.review = review

			new_json.data.push (current_record)
		}
	})
	
	// add new records to the existing records and notify slack
	for (var i = 0; i < new_json.data.length; i++) {
		existing_json.data.push (new_json.data[i])

        send_to_slack (
            "name: " + new_json.data[i].name + "\ndate: " + new_json.data[i].date + "\nstars: " + new_json.data[i].stars + "\nreview: ```" + new_json.data[i].review + "```",
            function (err, response) {}
        )
	}

	fs.writeFile(google_play_id + '.json', JSON.stringify(existing_json), function(err) {
    	if(err) return console.log(err)
	})
}

function cleanData (str) {
	return str.trim().replaceAll("\"", "\\\"")
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function send_to_slack (text, call_back) {
    slack.webhook({
      channel: slack_channel,
      username: "AndroidReviewBot",
      text: text
    }, function(err, response) {
        if (err) {
            console.log (err);
        } else {
            console.log(response);
        }

        call_back(err, response);
    });
}
