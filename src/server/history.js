function History() {
	this.messageHistory = [];
}

History.prototype.post = function(newMessage, callback){
	this.messageHistory.push(newMessage);
	callback();
}

History.prototype.get = function(token, callback){
	var answer = [];

	for(var i=token;i<this.messageHistory.length;i++){
		this.messageHistory[i].time = getDateTime();
		answer.push(this.messageHistory[i]);
	}

	callback(answer, this.messageHistory.length);
}

module.exports.history = History;

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    return hour + ":" + min;
}