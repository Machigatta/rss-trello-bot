// Each article has the following properties:
//
//   * "title"                - The article title (String).
//   * "author"               - The author's name (String).
//   * "link"                 - The original article link (String).
//   * "content"              - The HTML content of the article (String).
//   * "published"/"pubdate"  - The date that the article was published (Date).
//   * "feed"                 - {name, source, link}
//

var FeedParser = require('feedparser');
var http = require('http');
var fs = require('fs');
var Iconv = require('iconv').Iconv;
var async = require('async');
var request = require('request');
var utf8 = require('utf8');
var sprintf = require('sprintf-js').sprintf;

var UNABLE_TO_CONNECT = "Unable to connect.";
// var CURFEED = "";
var PUBDATE = new Array();
var FEEDS = new Array();
var FEED_LIST = new Array();
var LISTID = new Array();

var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

config.feed_list.forEach(function(feed_list_single) {
    FEEDS[feed_list_single.rss_krzl] = feed_list_single.rss_url;
    LISTID[feed_list_single.rss_krzl] = feed_list_single.trello_column;
    FEED_LIST.push(feed_list_single.rss_krzl);
})

/**
###################################################################################
To get the list-keys manually use:
  - https://api.trello.com/1/boards/[boardId]]/lists?key=[key]&token=[token]
###################################################################################
*/


var Trello = require("node-trello");
var t = new Trello(config.user.auth_key, config.user.auth_token);

(function() {

    var timeout = setInterval(function() {

        var asyncFuncAr = new Array();
        FEED_LIST.forEach(function(feed_short) {
            asyncFuncAr.push(function(callback) {
                feedMe(feed_short);
            });
        });

        async.parallel(asyncFuncAr, function done(err, results) {
            if (err) {
                throw err;
            }
        });
    }, 5000);
})();

function feedMe(feedName) {

    var updated = false;
    var newArticle = [];
    var allArticles = [];

    if (FEEDS[feedName] == "" || FEEDS[feedName] == undefined) {
        return;
    }

    var req = request(FEEDS[feedName], { timeout: 10000, pool: false });
    // Some feeds do not respond without user-agent and accept headers.
    req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
    req.setHeader('accept', 'text/html,application/xhtml+xml');
    var feedparser = new FeedParser();


    // Define our handlers
    req.on('error', done);
    req.on('response', function(res) {
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

        charset = getParams(res.headers['content-type']).charset;

        try {
            iconv = new Iconv(charset, 'utf8');
            res = res.pipe(iconv);
        } catch (err) {
            this.emit('error', done);
        }



        res.pipe(feedparser);
    });



    feedparser.on('error', done);
    feedparser.on('readable', function() {
        var post;
        while (post = this.read()) {
            allArticles.push(post);
        }
    });
    feedparser.on('end', function() {


        if (allArticles.length > 0) {
            for (var i = allArticles.length - 1; i >= 0; i--) {
                var entry = allArticles[i];

                var merkDate = new Date(entry.pubdate);

                if (PUBDATE[feedName] == "" || PUBDATE[feedName] == undefined) {
                    PUBDATE[feedName] = new Date();
                }

                var oldDate = new Date(PUBDATE[feedName]);


                if (oldDate.getTime() < merkDate.getTime()) {
                    updated = true;
                    newArticle.push(entry);
                }
            }
        }

        if (newArticle.length > 0) {
            for (var i = newArticle.length - 1; i >= 0; i--) {
                var entry = newArticle[i];

                console.log(sprintf("----------------------------------------------------------"));
                console.log(sprintf("> %1$s %2$s: %3$s", "New-RSS-Entry", "detected", "Checking for RSS: " + feedName));
                console.log(sprintf("---%1$s %2$s: %3$s", "Entry-Name", "", entry.title));
                console.log(sprintf("----%1$s %2$s: %3$s", "Link-Name", "", entry.link));
                console.log(sprintf("--%1$s %2$s: %3$s", "Create-Date", "", entry.pubdate));
                console.log(sprintf("-------%1$s %2$s: %3$s", "Status", "", "Creating-Trello-Card"));

                var formattedDate = new Date(entry.pubdate);
                var formattedDateString = formattedDate.getDate() + "." + (formattedDate.getMonth() + 1) + "." + formattedDate.getFullYear();
                formattedDateString += " " + formattedDate.getHours() + ":" + formattedDate.getMinutes() + ":" + formattedDate.getSeconds();


                var description = "";
                description += "URL:\r\n------\r\n" + entry.link;
                description += "\r\nDATE:\r\n------\r\n" + formattedDateString;
                description += "\r\n\r\n\r\n\r\nThis card was creaded by a [bot](https://github.com/Machigatta/rss-trello-bot)";

                t.post("/1/lists/" + LISTID[feedName] + "/cards", { name: entry.title, desc: description }, function(err, data) {
                    t.put("/1/cards/" + data.id + "/pos", { value: 0 }, function(err, data) {});
                });

                console.log(sprintf("-------%1$s %2$s: %3$s", "Status", "", "Trello-Card fully created"));
                console.log(sprintf("> %1$s %2$s: %3$s", "New-RSS-Entry", "detected", "Closing"));
                console.log(sprintf("----------------------------------------------------------"));
            }


        } else {
            // console.log(feedName + " nothing updated.");
        }

        if (updated == true) {
            PUBDATE[feedName] = new Date();
        }

    });

};

function done(err) {
    if (err) {
        console.log(err);
        return;
    }
}

function getParams(str) {
    var params = str.split(';').reduce(function(params, param) {
        var parts = param.split('=').map(function(part) { return part.trim(); });
        if (parts.length === 2) {
            params[parts[0]] = parts[1];
        }
        return params;
    }, {});
    return params;
}