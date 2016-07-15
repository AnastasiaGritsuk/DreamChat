var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
document.addEventListener('click', delegateEvent);
var shadow = document.getElementById('historyBox').createShadowRoot();
var popup = document.getElementById('popup');

var theMessage = function(text){
    return {
        id: uniqueId(),
        text:text,
        user: appState.user,
        flag: 0
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
    setUsername(newMessage.user);

    if(newMessageBox.value == '')
        return;

    newMessageBox.value = '';

    sendMessage(newMessage, function(){
        console.log('Message sent ' + newMessage);
    });
}

function setUsername(name){
    var userProfileName = document.getElementsByClassName('user-profile-name')[0];
    appState.user = name;
    userProfileName.innerHTML = name;
}

function sendMessage(message, continueWith){
    var xhr = new XMLHttpRequest();

    ajax('POST', appState.mainUrl, JSON.stringify(message), function(response){
        console.log('message has been sent ');
    });

}

function doPolling(){
    function loop(){
        var xhr = new XMLHttpRequest();

        ajax('GET', appState.mainUrl + '?token=' + appState.token, null, function(response){
            var response = JSON.parse(response);
            appState.token = response.token;

            updateHistory(response.messages);

            setTimeout(loop, 1000);
        });
    }

    loop();
}

function updateHistory(newMsg){
    if(newMsg.length === 0)
        return;

    var msgHistory = appState.history;

    if(msgHistory.length === 0){
        for(var i=0;i<newMsg.length;i++){
            msgHistory.push(newMsg[i]); 
            addMessageInternal(newMsg[i]);   
        }
        return;
    }
    
    for (var j = 0; j < msgHistory.length; j++) {
        

        for(var k = 0; k < newMsg.length;k++){
            if(msgHistory[j].id === newMsg[k].id){
                msgHistory[j].text = newMsg[k].text;
                newMsg[k].id = null;
            }    
        }

    }

    for(var n = 0; n < newMsg.length; n++){
        if(newMsg[n].id !== null){
            msgHistory.push(newMsg[n]);
            addMessageInternal(newMsg[n]);
        }
    }

    syncDomHistory(msgHistory);
}

function syncDomHistory(msgHistory){
    if(msgHistory.length === 0)
        return;

    var prevDomHistory = shadow.children;
    var index = 0;
    var k = 1;

    while(index < msgHistory.length){
        if(msgHistory[index] && prevDomHistory[k]){
            if(msgHistory[index].id == prevDomHistory[k].id){
                if(msgHistory[index].text != getMsgText(prevDomHistory[k])){
                    setMsgText(prevDomHistory[k], msgHistory[index].text);
                }
            }else{
                console.log('error');
                return null;
            }
        }
        index ++;
        k = k + 2;
    }
}

function getMsgText(item){
    return item.getElementsByClassName('message-text')[0].innerHTML;
}

function setMsgText(item, newText){
    item.getElementsByClassName('message-text')[0].innerHTML = newText;
}

function addMessageInternal(message){
    var mode;

    if(message.user != appState.user){
        mode = 'other';       
    }
  
    var element = elementFromTemplate(mode);
    renderItemState(element, message);
    shadow.appendChild(element);
}

function elementFromTemplate(mode){
    var template1 = document.getElementById('message-template');
    var template = document.importNode(template1.content, true);

    if(mode){
        template.children[1].classList.add('other');
    }
     
    return template;
}

function renderItemState(element, message){
    var item = element.children[1];
    item.id = message.id;
    item.getElementsByClassName('message-username')[0].innerHTML = message.user;
    item.getElementsByClassName('message-text')[0].textContent = message.text;
    item.getElementsByClassName('message-time')[0].textContent = message.time;
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

    if(evtObj.type == 'click' && evtObj.target.className == 'icon-male') {
        showPopup('changeusername');
        return;
    }

    if(evtObj.type == 'click' && evtObj.target.className == 'server-img' ) {
        showPopup('changeserver');
        return;
    }

    if(evtObj.type == 'click' && evtObj.target.className == 'icon-remove') {
        closePopup(evtObj);
        return;
    }

    // if(evtObj.type == 'click' && evtObj.path[6].dataset.state == 'changeusername') {
    //     changeUsername();
    //     return;
    // }

    // if(evtObj.type == 'click' && evtObj.path[6].dataset.state == 'changeserver') {
    //     changeServer();
    //     return;
    // }
}

function generatePopupState(state){
    var headerText = document.getElementsByClassName('popup_header_text')[0];
    var label = document.getElementsByClassName('newUsername_form_label')[0];
    if(state == 'changeserver'){
        headerText.innerHTML = 'New Server';
        label.innerHTML = "New Server";
        return;
    }
    if(state == 'changeusername'){
        headerText.innerHTML = 'New Username';
        label.innerHTML = "New Username";
        return;
    }
}

function showPopup(state){
    generatePopupState(state);
    popup.classList.remove('hidden');
    popup.classList.add('active');
    popup.dataset.state = state;
}

function closePopup(){
    popup.classList.remove('active');
    popup.classList.add('hidden');
}


function onEditClick(evtObj){
    var current = evtObj.path[2];
    current.parentNode.dataset.state = "edit"; 
}

function onEditComplete(evtObj){
    var current = evtObj.path[2];
    var input = current.getElementsByTagName('input')[0];

    var updatedMessage = {
        id: evtObj.path[3].id,
        text: input.value,
        user: appState.user,
        flag: 1
    }

    ajax('PUT', appState.mainUrl, JSON.stringify(updatedMessage), function(){
        current.parentNode.dataset.state = "initial"; 
    });
}

function onDeleteClick(evtObj){
    var current = evtObj.path[2];

    ajax('DELETE', appState.mainUrl + '/' + appState.user + '/delete/' + evtObj.path[3].id, null, function(){
        current.parentNode.dataset.state = "deleted"; 
    });
}

function ajax(method, url, data, continueWith, continueWithError){
    var xhr = new XMLHttpRequest();

    continueWithError = continueWithError || defaultErrorHandler;
    xhr.open(method || 'GET', url, true);

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

function changeServer(){

}

function changeUsername(){
    var newUsername = document.getElementById('newUsername').value;
    setUsername(newUsername);
    closePopup();
}

function scrollToBottom(){
    
    
}