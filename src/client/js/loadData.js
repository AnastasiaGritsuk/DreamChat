var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
var historyBox = document.getElementById('historyBox');

function run(){
    newMessageBox.addEventListener('keypress', function(e){
        if(e.keyCode == 13)
            onSendButtonClick();
        return false;
    });
    sendButton.addEventListener('click', onSendButtonClick);
    //doPolling();
}

function onSendButtonClick(){
	var newMessage = newMessageBox.value;

    if(newMessage.value == '')
        return;

    newMessageBox.value = '';

    sendMessage(newMessage, function(){
        console.log('Message sent ' + newMessage);
    });
}

function sendMessage(message, continueWith){
    var xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:8080/chat', true);
    //xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        var response = xhr.responseText;

        historyBox.innerHTML = response;
    }

    xhr.send(message);
}

function receiveData(){
	var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:8080/history', true);
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        var response = xhr.responseText;

        sendButton.innerHTML = response;
    }

    xhr.send(null);
}