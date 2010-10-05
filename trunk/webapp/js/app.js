/* EventTarget from N Zakas Professsional Javascript book */
function EventTarget(){
    this.handlers = {};    
}

EventTarget.prototype = {
    constructor: EventTarget,

    listen: function(type, handler){
        if (typeof this.handlers[type] == "undefined"){
            this.handlers[type] = [];
        }

        this.handlers[type].push(handler);
    },
    
    notify: function(event){
        if (!event.target){
            event.target = this;
        }
        if (this.handlers[event.type] instanceof Array){
            var handlers = this.handlers[event.type];
            for (var i=0, len=handlers.length; i < len; i++){
                handlers[i](event);
            }
        }            
    },

    ignore: function(type, handler){
        if (this.handlers[type] instanceof Array){
            var handlers = this.handlers[type];
            for (var i=0, len=handlers.length; i < len; i++){
                if (handlers[i] === handler){
                    break;
                }
            }
            
            handlers.splice(i, 1);
        }            
    }
};
/* define the pentaho namespace if it is not already defined. */
var pentaho = pentaho || {};

pentaho.app = function(app){
	EventTarget.call(this); //call parent object
	this.moduleData = [];
}

inheritPrototype(pentaho.app, EventTarget); //borrow the EventTarget's methods

pentaho.app.prototype.register = function(moduleId, creator){
	this.moduleData[moduleId] = {creator: creator, instance: null}
}  //end register

pentaho.app.prototype.start = function(moduleId, params){
	this.moduleData[moduleId].instance = new this.moduleData[moduleId].creator(this);
	this.moduleData[moduleId].instance.init(params);
}  //end start

pentaho.app.prototype.stop = function(moduleId){
	var data = this.moduleData[moduleId];
	if (data.instance) {
		data.instance.destroy();
		data.instance = null;
	}
}

pentaho.app.prototype.startAll = function(){
	for (var moduleId in this.moduleData){
		if (this.moduleData.hasOwnProperty(moduleId)){
			this.start(moduleId);
		}
	}
}
pentaho.app.prototype.stopAll = function(){
	for (var moduleId in this.moduleData){
		if (this.moduleData.hasOwnProperty(moduleId)){
			this.stop(moduleId);
		}
	}
}

pentaho.app.prototype.say = function(message) {
	this.notify({type: "message", message: message});
};
