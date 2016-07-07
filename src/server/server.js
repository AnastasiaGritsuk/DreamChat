var http = require('http');
var ecstatic = require('ecstatic');
var handler = ecstatic({ root: '../client', handleError:false });
var url = require('url');
var HistoryModule = require('./history');

var history = new HistoryModule.history();

http.createServer(function(request, response) {
	if(isMy(request.url) != -1){
		respond(request, response);
	}else{
		handler.apply(null, arguments);
	}	

}).listen(8080);

console.log('Listening on :8080');

function isMy(url){
	return url.indexOf('/chat');
}

function send404Response(response){
	response.writeHead(404, {"Content-Type":"text/plain"});
	response.write("Error 404: Page is not found");
	response.end();
}

function endResponse(response, answer){
	response.statusCode = 200;
	response.setHeader('Content-Type', 'application/json');
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.end(JSON.stringify(answer));
}

function extractToken(str){
	var token = str.split('?')[1].split('=')[1];

	if(token === ''){
		token = history.messageHistory.length;	
	}

	return token;
}

//Handle users requests
function respond(request, response) {

	var headers =  request.headers;
	var method = request.method;
	var url = request.url;

	var body = [];

	function awaitBody(done){
		request.on('error', function(err) {
			console.error(err);
		}).on('data', function(chunk) {
			body.push(chunk);
		}).on('end', function() {
			body = Buffer.concat(body).toString();
			done(body);
		});
	};	

	if(method !== "GET"){
		awaitBody(function(body){
			var message = JSON.parse(body);

			history.post(message, function(){
				endResponse(response);
			});
		});

		return;
	}

	if(method == "GET"){
		var token = extractToken(url);

		history.get(token, function(messages, newToken){
			endResponse(response, {messages:messages, token:newToken});
		});
		return;
	}
}

