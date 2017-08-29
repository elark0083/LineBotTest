const LINE_CHANNEL_ACCESS_TOKEN = 'w1F0tX1nyi/HIn5nK7uXMh5yi+m/s4LOKuEEWC8oRKcuwoO+JXpLiU/FCQjosIxk8IXwT06JfX4YLvjMI4gBwEx3253NvnXx5NZT4RuMQSbzji61uSCPCjn82PwxcLKp5oOx8vLql3awCVVgt1pEbAdB04t89/1O/w1cDnyilFU='';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.post('/webhook', function(req, res, next){
    res.status(200).end();
    for (var event of req.body.events){
        if (event.type == 'message' && event.message.text == 'ハロー'){
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    type: 'text',
                    text: 'こんにちは'
                }]
            }
            var url = 'https://api.line.me/v2/bot/message/reply';
            request({
                url: url,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
        }
    }
});
