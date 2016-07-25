var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
document.addEventListener('click', delegateEvent);
var historyBox = document.getElementById('historyBox');
var popup = document.getElementById('popup');
popup.addEventListener('click', delegatePopupEvent);

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
    doPolling(function(chunk){
        appState.token = chunk.token;
        syncHistory(chunk.messages, function(isRender){
            if(isRender)
                render(appState);    
        });
    });
}


function onSendButtonClick(){
	var newMessage = theMessage(newMessageBox.value);

    if(newMessageBox.value == '')
        return;

    newMessageBox.value = '';

    sendMessage(newMessage, function(){
    });
}

function sendMessage(message, continueWith){
    var xhr = new XMLHttpRequest();

    ajax('POST', appState.mainUrl, JSON.stringify(message), function(response){
        console.log('message has been sent');
    });

}

function doPolling(callback){
    function loop(){
        var xhr = new XMLHttpRequest();

        ajax('GET', appState.mainUrl + '?token=' + appState.token, null, function(response){
            var answer = JSON.parse(response);
            callback(answer);

            setTimeout(loop, 1000);
        });
    }

    loop();
}

function syncHistory(newMsg, callback){
    if(newMsg.length === 0){
        callback();
        return;
    }

    var msgMap = appState.history.reduce(function(accumulator, msg){
        accumulator[msg.id] = msg;

        return accumulator;
    },{});

    for(var i=0;i<newMsg.length;i++){
        var id = newMsg[i].id;
        var item = msgMap[id];

        if(item == null){
            appState.history.push(newMsg[i]);
            continue;
        }

        item.text = newMsg[i].text;
        item.status = newMsg[i].status;
    }

    callback(true);
}

function render(appState){
    if(appState.history.length === 0)
        return;

    var msgMap = appState.history.reduce(function(accumulator, msg){
        accumulator[msg.id] = msg;

        return accumulator;
    },{});

    updateList(historyBox, msgMap);
    appendToList(historyBox, appState.history, msgMap);
}

function updateList(element, msgMap){
    var children = element.children;

    for(var i=1;i<children.length;i=i+2){
        var child = children[i];
        var id = child.attributes['data-task-id'].value;
        var item = msgMap[id];

        renderItemState(child, item);
        msgMap[id] = null;      
    }
}

function appendToList(element, items, msgMap){
    for(var i=0; i<items.length; i++){
        var item = items[i];

        if(msgMap[item.id] == null)
            continue;

        var mode;

        if(item.user != appState.user){
            mode = 'other';       
        }

        msgMap[item.id] = null;

        var host = document.createElement('div');
        host.createShadowRoot();
        host.classList.add('message');
        host.setAttribute('data-state', "new");
        host.setAttribute('data-task-id', item.id);
        

        var child = elementFromTemplate(mode);
        renderItemState(child.children[0], item);
        host.appendChild(child);
        
        element.appendChild(host); 
    }
}

function elementFromTemplate(mode){
    var template = document.getElementById('message-template');
    var clone = document.importNode(template.content, true);

    if(mode){
        clone.children[1].classList.add('other');
    }
     
    return clone;
}

function renderItemState(item, message){
   // item.setAttribute('data-task-id', message.id);
    item.getElementsByClassName('message-username')[0].innerHTML = message.user;
    item.getElementsByClassName('message-text')[0].innerHTML = message.text;
    //item.getElementsByClassName('message-time')[0].innerHTML = message.time;
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
}

function delegatePopupEvent(evtObj){
    if(evtObj.type == 'click' && evtObj.path[6].dataset.state == 'changeusername') {
        changeUsername();
        return;
    }

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
        id: current.parentElement.dataset.taskId,
        text: input.value,
        user: appState.user 
    }

    ajax('PUT', appState.mainUrl, JSON.stringify(updatedMessage), function(){
        current.parentNode.dataset.state = "edited"; 
    });
}

function onDeleteClick(evtObj){
    var current = evtObj.path[2];

    ajax('DELETE', appState.mainUrl + '/'  + 'delete(' + evtObj.path[3].dataset.taskId + ')', null, function(){
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
    appState.user = newUsername;
    closePopup();
}