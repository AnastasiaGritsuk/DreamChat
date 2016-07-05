var sendButton = document.getElementById('sendButton');
var newMessageBox = document.getElementById('newMessageBox');
var historyBox = document.getElementById('historyBox');
historyBox.addEventListener('click', delegateEvent);
var shadow = document.getElementById('historyBox').createShadowRoot();

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
        console.log('message has been sent ');
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
    element.children[1].id = message.id;
    element.children[1].getElementsByClassName('message-username')[0].innerHTML = message.user;
    element.children[1].getElementsByClassName('message-text')[0].textContent = message.text;
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

    ajax('PUT', appState.mainUrl, JSON.stringify(updatedMessage), function(response){
        current.parentNode.dataset.state = "initial"; 
    });
}

function onDeleteClick(evtObj){
    var current = evtObj.path[2];

    var deletedMessage = {
        id: evtObj.path[3].id,
        text: "message has been removed",
        user: appState.user,
        flag: 1
    }

    ajax('DELETE', appState.mainUrl, JSON.stringify(deletedMessage), function(response){
        current.parentNode.dataset.state = "deleted"; 
    });
}

function ajax(method, url, data, continueWith, continueWithError){
    var xhr = new XMLHttpRequest();

    continueWithError = continueWithError || defaultErrorHandler;
    xhr.open(method || 'GET', url, true);

    //xhr.timeout = 5000;

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