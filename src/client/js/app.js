var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
var historyBox = document.getElementById('historyBox');
historyBox.addEventListener('click', delegateEvent);

var theMessage = function(text){
    return {
        id: uniqueId(),
        text:text,
        user: appState.user
    }
}

var uniqueId = function() {
    var date = Date.now();
    var random = Math.random() * Math.random();

    return Math.floor(date * random).toString();
};

var appState = {
    user: 'User' + uniqueId(),
    mainUrl: 'http://localhost:8080/chat',
    history:[],
    token: null
}

function run(){
    newMessageBox.addEventListener('keypress', function(e){
        if(e.keyCode == 13)
            onSendButtonClick();
        return false;
    });
    sendButton.addEventListener('click', onSendButtonClick);
    doPolling();
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
    xhr.open('POST', appState.mainUrl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
    }

    xhr.send(JSON.stringify(message));
}

function doPolling(){
    function loop(){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', appState.mainUrl + '?token=' + appState.token, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            var response = JSON.parse(xhr.responseText);
            appState.token = response.token;

            updateHistory(response.messages);
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
    var childnodes = historyBox.childNodes;

    for(var i=0;i < childnodes.length;i++){
        if(message.id == childnodes[i].getAttribute('id')){
            childnodes[i].getElementsByClassName('message-username')[0].innerHTML = message.user;
            childnodes[i].getElementsByClassName('message-text')[0].innerHTML = message.text;
            return;
        }
    }

    var element = elementFromTemplate();
    renderItemState(element, message);
    historyBox.appendChild(element);
}

function elementFromTemplate(){
    var template = document.getElementById('message-template');
    return template.firstElementChild.cloneNode(true);
}

function renderItemState(element, message){
    element.setAttribute('id', message.id);
    element.getElementsByClassName('message-username')[0].innerHTML = message.user;
    element.getElementsByClassName('message-text')[0].innerHTML = message.text;
}

function delegateEvent(evtObj){
    if(evtObj.type == 'click' && evtObj.target.className == 'icon-edit') {
        onEditClick(evtObj);
        return;
    }

    if(evtObj.type == 'click' && evtObj.target.className == 'icon-remove-circle') {
        onDeleteClick(evtObj);
        return;
    }
}

function onEditClick(evtObj){
    var updatedMessage = {
        id: evtObj.path[2].id,
        text:'updated!!!!',
        user: appState.user
    }

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', appState.mainUrl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
    }

    xhr.send(JSON.stringify(updatedMessage));

}

function onDeleteClick(evtObj){
    alert('x');
}