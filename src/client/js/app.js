var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
var historyBox = document.getElementById('historyBox');
historyBox.addEventListener('click', delegateEvent);
var shadow = document.getElementById('historyBox').createShadowRoot();

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
    token: ''
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

    ajax('POST', appState.mainUrl, JSON.stringify(message), function(response){
        console.log('message has been sent ' + response);
    }, function(errorText){
        console.log(errorText);
    });

}

function doPolling(){
    function loop(){

        var xhr = new XMLHttpRequest();

        ajax('GET', appState.mainUrl + '?token=' + appState.token, null, function(response){
            var response = JSON.parse(response);
            appState.token = response.token;

            for(var i=0;i<response.messages.length;i++){
                appState.history.push(response.messages[i]);
            }

            updateHistory(response.messages);

            setTimeout(loop, 3000);
        });
    }

    loop();
}

function updateHistory(newMessages){

    for(var i = 0; i < newMessages.length; i++)
        addMessageInternal(newMessages[i]);
}

function addMessageInternal(message){
    var childnodes = shadow.children;

    for(var i=0;i < childnodes.length;i++){

        if(message.id == childnodes[i].getAttribute('id')){

            childnodes[i].getElementsByClassName('message-username')[0].innerHTML = message.user;
            childnodes[i].getElementsByClassName('message-text')[0].innerHTML = message.text;
            return;
        }

    }

    if(message.user != appState.user){
        var element = elementFromTemplate('other');
        renderItemState(element, message);

        shadow.appendChild(element);        
    }
    else{
        var element = elementFromTemplate();
        renderItemState(element, message);
        shadow.appendChild(element);
    }
}

function elementFromTemplate(mode){
    var template1 = document.getElementById('message-template');
    var template = document.importNode(template1.content, true);

    if(!mode)
        return template;
    // template.firstElementChild.cloneNode(true)
    
    var otherMes = template.children[1];
    template.children[1].classList.add('other');
    template.children[1].getElementsByClassName('message-edit')[0].classList.add('hidden');
    template.children[1].getElementsByClassName('message-delete')[0].classList.add('hidden');
    return template;
}

function renderItemState(element, message){
    element.children[1].setAttribute('id', message.id);
    element.children[1].getElementsByClassName('message-username')[0].innerHTML = message.user;
    element.children[1].getElementsByClassName('message-text')[0].innerHTML = message.text;
}

function delegateEvent(evtObj){
    if(evtObj.type == 'click' && evtObj.path[0].className == 'icon-edit') {
        onEditClick(evtObj);
        return;
    }

    if(evtObj.type == 'click' && evtObj.path[0].className == 'icon-remove-circle') {
        onDeleteClick(evtObj);
        return;
    }

    if(evtObj.type == 'click' && evtObj.path[0].className == 'fa fa-check-square-o') {
        onEditComplete(evtObj);
        return;
    }
}

function onEditClick(evtObj){
    var current = evtObj.path[2];
    var input = current.getElementsByTagName('input')[0];

    input.classList.remove('hidden');
    input.classList.add('active-inline');

    var oldText = current.getElementsByClassName('message-text')[0];
    oldText.classList.add('hidden');

    var editIcon = current.getElementsByClassName('message-edit')[0];
    editIcon.classList.add('hidden');
    input.classList.remove('hidden');
    input.classList.add('active-inline');

    var completeIcon = current.getElementsByClassName('message-edit-complete')[0];
    completeIcon.classList.remove('hidden');
    completeIcon.classList.add('active-inline');

}

function onEditComplete(evtObj){

    var current = evtObj.path[2];
    var input = current.getElementsByTagName('input')[0];

    var updatedMessage = {
        id: evtObj.path[3].id,
        text: input.value,
        user: appState.user
    }

    ajax('PUT', appState.mainUrl, JSON.stringify(updatedMessage), function(response){
        input.classList.remove('active-inline');
        input.classList.add('hidden');

        var oldText = current.getElementsByClassName('message-text')[0];
        oldText.classList.remove('hidden');
        oldText.classList.add('active-inline');

        var editIcon = current.getElementsByClassName('message-edit')[0];
        editIcon.classList.remove('hidden');
        editIcon.classList.add('active-inline');
        var completeIcon = current.getElementsByClassName('message-edit-complete')[0];
        completeIcon.classList.remove('active-inline');
        completeIcon.classList.add('hidden');
    });
}

function onDeleteClick(evtObj){

    var deletedMessage = {
        id: evtObj.path[3].id,
        text: "message has been removed",
        user: appState.user
    }

    ajax('DELETE', appState.mainUrl, JSON.stringify(deletedMessage), function(response){
        console.log('message has been removed ' + response);
    });
}

function ajax(method, url, data, continueWith, continueWithError){
    var xhr = new XMLHttpRequest();

    continueWithError = continueWithError || defaultErrorHandler;
    xhr.open(method || 'GET', url, true);

    xhr.timeout = 5000;

    xhr.onload = function(){
        if(xhr.readyState !==4)
            return;

        if(xhr.status !=200){
            continueWithError('Error on the server side, response ' + xhr.status);
            return;
        }

        if(isError(xhr.responseText)) {
            continueWithError('Error on the server side, response ' + xhr.responseText);
            return;
        }

        continueWith(xhr.responseText);

    };

    xhr.ontimeout = function(){
        continueWithError('Server timed out !');
    };

    xhr.onerror = function (e) {
        var errMsg = 'Server connection error !\n'+
        '\n' +
        'Check if \n'+
        '- server is active\n'+
        '- server sends header "Access-Control-Allow-Origin:*"\n'+
        '- server sends header "Access-Control-Allow-Methods: PUT, DELETE, POST, GET, OPTIONS"\n';

        continueWithError(errMsg);
    };

    xhr.send(data);

}

window.onerror = function(err) {
   // output(err.toString());
};


function defaultErrorHandler(message){
    console.error(message);
    // output(message);
}

function isError(text){
    if(text == "")
        return false;

    try{
        var obj = JSON.parse(text);
    }catch(ex){
        return true;
    }

    return !!obj.error;
}