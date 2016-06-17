var http = require('http');
var ecstatic = require('ecstatic');
var handler = ecstatic({ root: '../client', handleError:false });
var url = require('url');

var messageHistory = [];

http.createServer(function(request, response) {
	if(isMy(request.url) != -1){
		requestListener(request, response);
	}else{
		handler.apply(null, arguments);
	}	

}).listen(8080);

console.log('Listening on :8080');

function isMy(url){
	console.log(url);
	return url.indexOf('/chat');
}

function send404Response(response){
	response.writeHead(404, {"Content-Type":"text/plain"});
	response.write("Error 404: Page is not found");
	response.end();
}

var body = [];

//Handle user requests
function requestListener(request, response) {
	console.log('here');
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

			// var responseBody = {
			// 	headers: headers,
			// 	method:method,
			// 	url:url,
			// 	body:body
			// };

			// response.write(JSON.stringify(responseBody));
			messageHistory.push(JSON.parse(body));
			body = [];
			console.log(messageHistory);
			response.end();
		});
	}

	if(method == "GET"){



		response.statusCode = 200;
		response.setHeader('Content-Type', 'application/json');
		response.write(JSON.stringify(body));
		response.end();
	}

	else if(request.method == "GET" && request.url == "/history"){

		response.writeHead(200, {"Content-Type":"text/plain"});
		response.write('history');
		
	}	
	
	
}