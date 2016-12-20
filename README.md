# rss-trello-bot
The main purpose of the bot is to gather many rss-feed-links and ask for updates [in a specific interval]. If there is a new post on the rss-feed, he will create a trello-card in a specific trellobord->trellocolumn->position 1.

<h4>Main-Files</h4>
<ul>
<li>./node_modules/</li>
<li>./bot.js</li>
<li>./process.json</li>
<li>./config.json</li>
</ul>

# Required node_modules
<ul>
<li><a href="https://www.npmjs.com/package/feedparser">feedparser</a></li>
<li><a href="https://www.npmjs.com/package/async">async</a></li>
<li><a href="https://github.com/bnoordhuis/node-iconv">iconv</a></li>
<li><a href="https://www.npmjs.com/package/node-trello">node-trello</a></li>
<li><a href="https://www.npmjs.com/package/request">request</a></li>
<li><a href="https://github.com/alexei/sprintf.js/">sprintf-js</a></li>
<li><a href="https://www.npmjs.com/package/utf8">utf8</a></li>
</ul>

# Usage
Here is a list of how to configure, use and log the bot.
<h3>Configurate</h3>
To configurate the bot just use the config.js.
<pre>
{
    "user": {
        "auth_key": "personal_user_key",
        "auth_token": "auth_key"
    },
    "feed_list": [
        { "rss_url": "URL", "rss_krzl": "UNIQUE_SHORTNAME", "trello_column": "TRELLO_COLUMN_ID"},
        { "rss_url": "URL", "rss_krzl": "UNIQUE_SHORTNAME", "trello_column": "TRELLO_COLUMN_ID"}
    ]
}

</pre>
<h3>Sarting the bot</h3>
To start the bot you could use 
<pre>node bot.js</pre> 
or use a framework like pm2 
<pre>pm2 start bot.js</pre>
<h3>Logging</h3>
Currently there is just the simple js-logging 
<pre>console.log</pre>
But if you're using pm2 you will be able to get your log.file anyway.
#Features planned
<ul>
<li>Date-saving</li>
<li>Position-perfoming (sort multiple created cards correctly)</li>
</ul>

# Troubleshooting
If you're about to run into some troubles or issues just make sure to report in on this github-project. I will take a look at them.