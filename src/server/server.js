var http = require('http');
var fs = require('fs');
var ecstatic = require('elliptical-ecstatic');

function send404Response(response){
	response.writeHead(404, {"Content-Type":"text/plain"});
	response.write("Error 404: Page is not found");
	response.end();
}

var arr = [];

//Handle user requests
function requestListener(request, response) {

	if(request.method == "GET" && request.url == "/"){
		response.writeHead(200, {"Content-Type":"text/html"});
		fs.createReadStream("../client/index.html").pipe(response);
	}else if(request.method == "POST" && request.url == "/add"){

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
		
	}else{
		fs.createReadStream("../client" + request.url).pipe(response);
	}
}

http.createServer(requestListener).listen(8080);
console.log('Server is running now...');