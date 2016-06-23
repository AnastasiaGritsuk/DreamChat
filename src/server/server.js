var http = require('http');
var ecstatic = require('ecstatic');
var staticHandler = ecstatic({ root: '../client', handleError:false });
var url = require('url');

var messageHistory = [];
var tokenHistory = [];
var currentToken =  0 ;

http.createServer(function(request, response) {
	if(isMy(request.url) != -1){
		handler(request, response);
	}else{
		staticHandler.apply(null, arguments);
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

var body = [];

//Handle user requests
function handler(request, response) {
	var headers =  request.headers;
	var method = request.method;
	var url = request.url;
	
	if(method == "POST"){

		request.on('error', function(err) {
			console.error(err);
		}).on('data', function(chunk) {
			body.push(chunk);

		}).on('end', function() {
			body = Buffer.concat(body).toString();

			response.on('error', function(err) {
				console.error(err);
			});

			response.statusCode = 200;
			response.setHeader('Content-Type', 'application/json');
			response.setHeader("Access-Control-Allow-Origin", "*");
			messageHistory.push(JSON.parse(body));
			body = [];
			currentToken = currentToken + 1;
			tokenHistory.push(currentToken);
			console.log(currentToken);
			response.end();
		});
	}

	if(method == "GET"){

		console.log(url);

		if(url.search(/token=/i) == -1) {
			response.statusCode = 400;
			response.write('bad request');
			response.end();
			return;
		}

		var token = +url.split('?')[1].split('=')[1];
		if(token == null){
			token == messageHistory.length;
		}
		var messagesArr = [];
		for(var i=token;i<messageHistory.length;i++){
			messagesArr.push(messageHistory[i]);
		}

		var responseBody = {
			messages: messagesArr,
			token: currentToken
		};

		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.write(JSON.stringify(responseBody));
		response.end();
	}

	if(method == 'PUT'){
		request.on('error', function(err) {
			console.error(err);
		}).on('data', function(chunk) {
			body.push(chunk);

		}).on('end', function() {
			body = Buffer.concat(body).toString();

			response.on('error', function(err) {
				console.error(err);
			});

			response.statusCode = 200;
			response.setHeader('Content-Type', 'application/json');
			messageHistory.push(JSON.parse(body));
			body = [];
			currentToken = currentToken + 1;
			tokenHistory.push(currentToken);
			response.end();
		});
	}

	if(method == 'DELETE'){
		// var messageId = +url.split('?')[1].split('=')[1];

		// var deletedMessage = {
		// 	id: messageId,
		// 	text: "message has been removed",
		// 	user: ''
		// }
		
		// messageHistory.push(deletedMessage);

		// response.statusCode = 200;
		// response.setHeader('Content-Type', 'application/json');
		// response.setHeader("Access-Control-Allow-Origin", "*");
		// currentToken = currentToken + 1;
		// tokenHistory.push(currentToken);

		// response.end();

		request.on('error', function(err) {
			console.error(err);
		}).on('data', function(chunk) {
			body.push(chunk);

		}).on('end', function() {
			body = Buffer.concat(body).toString();

			response.on('error', function(err) {
				console.error(err);
			});

			response.statusCode = 200;
			response.setHeader('Content-Type', 'application/json');
			response.setHeader("Access-Control-Allow-Origin", "*");
			messageHistory.push(JSON.parse(body));
			body = [];
			currentToken = currentToken + 1;
			tokenHistory.push(currentToken);
			console.log(currentToken);
			response.end();
		});
	}
}