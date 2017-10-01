var WebChannel;
var EventBridge;

function QTWebLink(){
    this.setupCallback = null;
    this.WebChannel = null;
    this.EventBridge = null;
    this.scriptEvents = {};
}

QTWebLink.prototype.send = function(type,data){
    if(this.EventBridge !== null){
        console.log({type:type,data:data});
        this.EventBridge.emitWebEvent(JSON.stringify({type:type,data:data}));
    }
};
QTWebLink.prototype.regCallback = function(type,func){
    if(typeof type !== "string")return false;
    this.scriptEvents[type.toLowerCase()] = func;
    return true;
};
QTWebLink.prototype.scriptEvent = function(web,data){
    data = JSON.parse(data);
    if(!(data instanceof Array))data = [data];
    var e;
    for(var i in data){
        e = data[i];
        if(e.hasOwnProperty("type") && e.hasOwnProperty("data")){
            e.type = e.type.toLowerCase();
            if(web.scriptEvents.hasOwnProperty(e.type)){
                web.scriptEvents[e.type](e.data);
            }
        }
    }
};
QTWebLink.prototype.webEventBridgeCallback = function(web){
    if(web.EventBridge !== null){
        web.EventBridge.scriptEventReceived.connect(function(data){web.scriptEvent(web,data);});
        web.setupCallback();
    }
};
QTWebLink.prototype.webChannelCallback = function(web){
    web.EventBridge = web.WebChannel.objects.eventBridgeWrapper.eventBridge;
    web.webEventBridgeCallback(web);
};
QTWebLink.prototype.start = function(callback){
    this.setupCallback = callback;
    var that = this;
    this.WebChannel = new QWebChannel(qt.webChannelTransport, function(){that.webChannelCallback(that)});
}
