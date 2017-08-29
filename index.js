var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var crypto = require("crypto");
var request = require('request');
var async = require('async');

app.set('port', (process.env.PORT || 8000));
// JSONの送信を許可
app.use(bodyParser.urlencoded({
    extended: true
}));
// JSONのパースを楽に（受信時）
app.use(bodyParser.json());

app.post('/', function(req, res) {
    async.waterfall([
            function(callback) {
                // リクエストがLINE Platformから送られてきたか確認する
                if (!validate_signature(req.headers['x-line-signature'], req.body)) {
                    return;
                }
                // テキストが送られてきた場合のみ返事をする
                if ((req.body['events'][0]['type'] != 'message') || (req.body['events'][0]['message']['type'] != 'text')) {
                    return;
                }

                if (req.body['events'][0]['source']['type'] == 'user') {
                    // ユーザIDでLINEのプロファイルを検索して、ユーザ名を取得する
                    var user_id = req.body['events'][0]['source']['userId'];
                    var get_profile_options = {
                        url: 'https://api.line.me/v2/bot/profile/' + user_id,
                        json: true,
                        headers: {
                            'Authorization': 'Bearer {Channel Access Token}'
                        }
                    };
                    request.get(get_profile_options, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            callback(body['displayName'] + 'さんから送られた文章の\n');
//1対1の対応
                        }
                    });
                } else if ('room' == req.body['events'][0]['source']['type']) {
                    callback('みなさまから送られた文章の\n');
//グループ対1の対応
                }
            },
        ],
        function(displayName) {
            //ヘッダーを定義
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {Channel Access Token}',
            };

            // 送信データ作成
            var data = {
                'replyToken': req.body['events'][0]['replyToken'],
                "messages": [{
                    "type": "text",
                    "text": displayName + '文字数は ' + textcount(req.body['events'][0]['message']['text']) + '文字です。'
                }]
            };

            //オプションを定義
            var options = {
                url: 'https://api.line.me/v2/bot/message/reply',
                headers: headers,
                json: true,
                body: data
            };

            request.post(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                } else {
                    console.log('error: ' + JSON.stringify(response));
                }
            });
        }
    );
});

app.listen(app.get('port'), function() {
    console.log('Node app is running');
});

function textcount(body) {
    return body.length;
}

// 署名検証
function validate_signature(signature, body) {
    return signature == crypto.createHmac('sha256', 'CHANNELL_SECRET').update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}
