var http = require('http');
var ecstatic = require('ecstatic');
var handler = ecstatic({ root: __dirname + '/public', handleError:false });

http.createServer(function(request, response) {
	console.log('path is ' + __dirname);
	console.log('handler ' + handler);

	if(request.url == "/"){
		handler.apply(null, arguments);
	}else{
		requestListener(request, response);
	}
	
}).listen(8080);

console.log('Listening on :8080');



function send404Response(response){
	response.writeHead(404, {"Content-Type":"text/plain"});
	response.write("Error 404: Page is not found");
	response.end();
}

var arr = [];

//Handle user requests
function requestListener(request, response) {

	if(request.method == "POST" && request.url == "/add"){

		request.on('data', function(chunk) {
			arr.push(chunk.toString());
			response.write("added " + chunk);
		}).on('end', function() {
		  	response.end();
		});
	}else if(request.method == "GET" && request.url == "/getData"){
		response.writeHead(200, {"Content-Type":"text/plain"});
		response.write(arr.toString());
		response.end();
	}
}

