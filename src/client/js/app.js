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

            if(xhr.status == 400){
                console.log(xhr.responseText);
            }else{
                var response = JSON.parse(xhr.responseText);
                appState.token = response.token;

                updateHistory(response.messages);
            }
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
        id: evtObj.path[2].id,
        text: input.value,
        user: appState.user
    }

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', appState.mainUrl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
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

    }

    xhr.send(JSON.stringify(updatedMessage));
}

function onDeleteClick(evtObj){

    var deletedMessage = {
        id: evtObj.path[2].id,
        text: "message has been removed",
        user: appState.user
    }

    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', appState.mainUrl, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
    }

    xhr.send(JSON.stringify(deletedMessage));
}