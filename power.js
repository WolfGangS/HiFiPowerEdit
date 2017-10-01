/*
PowerEditor

Created by Wolfgang
on  30/9/2017


Scripts Released Under CC Attribution 4.0
http://creativecommons.org/licenses/by/4.0/

*/
(function() {


    Messages.subscribe("selection-events");
    Messages.subscribe("io.wlf.hifi.poweredit");

    Messages.messageReceived.connect(handleEntitySelectionToolUpdates);

    function handleEntitySelectionToolUpdates(channel, message, sender) {
        if (sender !== MyAvatar.sessionUUID){
        	return;
        }

        var json;
        try {
            json = JSON.parse(message);
        } catch (err) {
            print("error -- gotWrongSelectMessage: " + message);
            return;
        }
        if(channel === "selection-events"){
        	if (json.action == "selected") {
            	sendData(json.ids[0]);
        	}
    	} else if (channel === "io.wlf.hifi.poweredit"){
    		if(json.action == "poweredit"){
    			sendData(json.id);
    			setWebState(true);
    		}
    	}
    }

    var html = Script.resolvePath("html/editor.html?" + Date.now());

    var isActive = false;
    var isPicker = false;

    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    //print(JSON.stringify(Object.keys(tablet)));
    var button = tablet.addButton({
        icon: "https://wlf.io/svg/spanner-white.svg",
        activeIcon: "https://wlf.io/svg/spanner.svg",
        text: "Editor",
        isActive: false,
        sortOrder: 30
    });


    var editorUI = new OverlayWebWindow({
        title: "Editor",
        source: html,
        width: 500,
        height: 800,
        visible: false
    });

    function toggleWebState() {
    	setWebState(!isActive);
    }

    function setWebState(on){
    	isActive = on;
        editorUI.setVisible(isActive);
        button.editProperties({ isActive: isActive });
    }

    button.clicked.connect(toggleWebState);

    editorUI.webEventReceived.connect(function(msg) {
        msg = JSON.parse(msg);
        if(msg.type === "picker"){
        	isPicker = true;
        } else if(msg.type === "jsonData") {
        	print(JSON.stringify(msg));
        	if(msg.data.props.hasOwnProperty("id")){
        		delete msg.data.props["id"];
        	}
        	if(msg.data.props.hasOwnProperty("userData")){
        		//msg.data.props.userData = JSON.stringify(msg.data.props.userData);
        	}
        	Entities.editEntity(msg.data.id,msg.data.props);
        } else if(msg.type === "jsonDataRequest"){
        	sendData(msg.data);
        }
    });


    Script.scriptEnding.connect(function() {
    	Controller.mouseReleaseEvent.disconnect(mouseReleaseEvent);
        button.clicked.disconnect(toggleWebState);
        tablet.removeButton(button);
    });



    function sendScriptEvent(type, data) {
        if (editorUI != null) {
            editorUI.emitScriptEvent(JSON.stringify({ type: type, data: data }));
        }
    }

    function mouseReleaseEvent(event) {
        if (!isActive || !isPicker){return;}
        isPicker = false;
        var clicked = findClickedEntity(event);
        if(clicked === null || clicked === undefined){return;}
        sendData(clicked.entityID);
    }

    function sendData(id){
    	var data = Entities.getEntityProperties(id);

    	data.userData = JSON.parse(data.userData);
    	data.locked = data.locked == 1;
    	data.dynamic = data.dynamic == 1;
    	data.visible = data.visible == 1;

        sendScriptEvent("jsonData", data);
    }

    Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

    function findClickedEntity(event) {
        var pickZones = event.isControl;

        if (pickZones) {
            Entities.setZonesArePickable(true);
        }

        var pickRay = Camera.computePickRay(event.x, event.y);

        var overlayResult = Overlays.findRayIntersection(pickRay, true, [HMD.tabletID, HMD.tabletScreenID, HMD.homeButtonID]);
        if (overlayResult.intersects) {
            return null;
        }

        var entityResult = Entities.findRayIntersection(pickRay, true); // want precision picking
        //var iconResult = entityIconOverlayManager.findRayIntersection(pickRay);
        //iconResult.accurate = true;

        if (pickZones) {
            Entities.setZonesArePickable(false);
        }

        var result;

        /*if (iconResult.intersects) {
            result = iconResult;
        } else */if (entityResult.intersects) {
            result = entityResult;
        } else {
            return null;
        }

        if (!result.accurate) {
            return null;
        }

        var foundEntity = result.entityID;
        return {
            pickRay: pickRay,
            entityID: foundEntity,
            intersection: result.intersection
        };
    }

})();