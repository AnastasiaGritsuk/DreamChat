var http = require('http');
var ecstatic = require('ecstatic');
var handler = ecstatic({ root: '../client', handleError:false });
var url = require('url');

http.createServer(function(request, response) {
	if(isMy(request.url)){
		requestListener(request, response);
	}else{
		handler.apply(null, arguments);
	}	

}).listen(8080);

console.log('Listening on :8080');

function isMy(url){
	return url == '/chat' || url == "/history";
}

function send404Response(response){
	response.writeHead(404, {"Content-Type":"text/plain"});
	response.write("Error 404: Page is not found");
	response.end();
}

var arr = [];

//Handle user requests
function requestListener(request, response) {

	if(request.method == "POST" && request.url == "/chat"){
		var data = '';
		request.on('data', function(text) {
			data = text;	
			data = JSON.parse(data);
			response.write(JSON.stringify(data));		
		});

		request.on('end', function() {
			response.end();
		});

	}else if(request.method == "GET" && request.url == "/history"){
		response.writeHead(200, {"Content-Type":"text/plain"});
		response.write(arr.toString());
		
	}

	
	
}