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

            if(response.messages.length !== 0){
                for(var i=0;i<response.messages.length;i++){
                    appState.history.push(response.messages[i]);
                }

                updateHistory();
            }
            setTimeout(loop, 1000);
        });
    }

    loop();
}

function updateHistory(){

    var childnodes = shadow.children;
    var mesHistory = appState.history;

    var j = 1;

    for (var i = 0; i < mesHistory.length; i++){
        if(mesHistory[i].flag === 0 && !childnodes[j]){
            addMessageInternal(mesHistory[i]);
            continue;
        }

        if(childnodes[j] && mesHistory[i].flag === 0 && mesHistory[i].id === childnodes[j].id){
            j = j + 2;
            continue;
        }

        if(mesHistory[i].flag === 1 && (!childnodes[j] || mesHistory[i].id !== childnodes[j].id) ){
            for(var k = 1; k < childnodes.length; k = k + 2){
                if(mesHistory[i].id == childnodes[k].id){
                    if(mesHistory[i].text !== childnodes[k].getElementsByClassName('message-text')[0].innerHTML){
                        childnodes[k].getElementsByClassName('message-text')[0].textContent = mesHistory[i].text;
                        childnodes[k].getElementsByClassName('message-time')[0].innerHTML = mesHistory[i].time;
                    }
                }
            }
        }
    } 
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

    if(evtObj.type == 'click' && evtObj.path[6].dataset.state == 'changeusername') {
        changeUsername();
        return;
    }

    if(evtObj.type == 'click' && evtObj.path[6].dataset.state == 'changeserver') {
        changeServer();
        return;
    }
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