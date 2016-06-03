var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
var historyBox = document.getElementById('historyBox');

var theMessage = function(text){
    return {
        text:text
    }
}

var appState = {
    history:[]
}

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
	var newMessage = theMessage(newMessageBox.value);

    if(newMessageBox.value == '')
        return;

    newMessageBox.value = '';

    sendMessage(newMessage, function(){
        console.log('Message sent ' + newMessage);
    });
}

function sendMessage(message, continueWith){
    var xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:8080/chat', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        var response = JSON.parse(xhr.responseText);
        console.log('here is response ' + response);
        historyBox.innerHTML = response.text;
    }

    xhr.send(JSON.stringify(message));
}

function doPolling(){
    function loop(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8080/history', true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            var response = JSON.parse(xhr.responseText);
            console.log(response);

            updateHistory(response);
            setTimeout(loop, 1000);
        }

        xhr.send(null);

    }

    loop();
}

function updateHistory(newMessages){
    for(var i = 0; i < newMessages.length; i++)
        addMessageInternal(newMessages[i]);
}

function addMessageInternal(message){
    historyBox.innerText = message;
}