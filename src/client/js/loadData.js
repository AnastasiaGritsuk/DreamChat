var answer = document.getElementById('answer');
var data = document.getElementById('data');

function addData(){
	var newData = data.value;
	
	var xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:8080/add', true);
    //xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        var response = xhr.responseText;

        answer.innerHTML = response;
    }

    xhr.send(newData);
}

function receiveData(){
	var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:8080/getData', true);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        var response = xhr.responseText;

        answer.innerHTML = response;
    }

    xhr.send(null);
}