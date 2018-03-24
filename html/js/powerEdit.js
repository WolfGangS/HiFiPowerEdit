/*
PowerEditor

Created by Wolfgang
on  30/9/2017

 * @license
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.

*/
(function() {
    //window.setInterval(function(){console.log("boop");},500);
    var options = {
        mode: "tree",
        schema: EntitySchema,
        schemaRefs: SchemaRefs,
        //onChange: jsonChange,
        onModeChange: modeChange,
        onEditable: onEditable,
        sortObjectKeys: true,
        onError: onError
    };
    var webLink = null;
    var container = document.getElementById("jsoneditor");
    var editor = new JSONEditor(container, options);
    var jsonData = null;
    var isSafe = false;


    function addButtons() {
        $(".jsoneditor-menu").prepend(
            $("<button>").on("click", function() {
                webLink.send("picker", {});
            }).attr("title", "Select Entity")
        );
        $("<button>").on("click", function() {
            safeSendDiff();
        }).text("Apply").attr("style", "width:auto;background-position:-96px -120px;padding:0px 5px 0px 5px;").insertBefore("table.jsoneditor-search");

        $("<button>").on("click", function() {
            webLink.send("jsonDataRequest", jsonData.id);
        }).text("Refresh").attr("style", "width:auto;background-position:-96px -120px;padding:0px 5px 0px 5px;").insertBefore("table.jsoneditor-search");
    }

    addButtons();

    $("body").on("blur", ".jsoneditor-value", focusLoss);
    $("body").on("click", "button.jsoneditor-redo", focusLoss);
    $("body").on("click", "button.jsoneditor-undo", focusLoss);
    $("body").on("change", "select", focusLoss);
    $("body").on("change", "input", focusLoss);
    $("body").on("keydown", ".jsoneditor-value", function(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            $(":focus").blur();
        }
    });

    function focusLoss() {
        if (!isSafe) return;
        if ($(".jsoneditor-value:focus").length) return;
        safeSendDiff(false);
    }

    function safeSendDiff(force) {
        editor.validate();
        if (editor.errorNodes.length < 1) {
            var nd = editor.get();
            if (force) {
                webLink.send("jsonData", { id: jsonData.id, props: nd });
                jsonData = nd;
            } else {
                var dif = onlyChanges(jsonData, nd);
                if (Object.keys(dif).length > 0) {
                    webLink.send("jsonData", { id: jsonData.id, props: dif });
                    jsonData = nd;
                    if (dif.hasOwnProperty("locked")) {
                        webLink.send("jsonDataRequest", jsonData.id);
                    }
                }
            }
        }
    }

    // get json
    //var json = editor.get();EventBridge.scriptEventReceived
    document.addEventListener('DOMContentLoaded', function() {
        EventBridge.scriptEventReceived.connect(scriptIn);
    });

    function scriptIn(data) {
        data = JSON.parse(data);
        if (!(data instanceof Array)) data = [data];
        console.log(data);
        var e;
        for (var i in data) {
            e = data[i];
            if (e.hasOwnProperty("type") && e.hasOwnProperty("data")) {
                e.type = e.type.toLowerCase();
                switch (e.type) {
                    case "jsondata":
                        isSafe = false;
                        jsonData = e.data;
                        console.log(e.data);
                        editor.set(jsonData);
                        editor.expandAll();
                        $(".jsoneditor-contextmenu").remove();
                        //lockID();
                        window.setTimeout(function() {
                            isSafe = true;
                        }, 1000);
                        break;
                }
            }
        }
    }
    /*
    webLink = new QTWebLink();
    webLink.start(function(e) {
        webLink.regCallback("jsonData", function(data) {
            console.log(data);
            isSafe = false;
            jsonData = data;
            editor.set(jsonData);
            editor.expandAll();
            $(".jsoneditor-contextmenu").remove();
            //lockID();
            window.setTimeout(function() {
                isSafe = true;
            }, 1000);
        });
    });*/

    function modeChange(n, o) {
        //lockID();
        addButtons();
    }

    function onError(e) {
        //console.log(JSON.stringify(e));
    }

    function onEditable(n) {
        //console.log(JSON.stringify(n));
        var field = false;
        var value = true;
        if (jsonData != null) {
            if (jsonData.locked == true) value = false;
        }
        if (n.path.length == 1) {
            switch (n.path[0]) {
                case "id":
                    value = false;
                    break;
                case "locked":
                    value = true;
                    break;
            }
        } else {
            switch (n.path[0]) {
                case "userData":
                case "texturest":
                    field = true;
                    break;
            }
        }

        return { field: field, value: value };
    }

    function onlyChanges(obj1, obj2) {
        var obj = {};
        var ks = Object.keys(obj1);
        for (var i = 0; i < ks.length; i++) {
            if (typeof obj1[ks[i]] == "object") {
                if (objCompare(obj1[ks[i]], obj2[ks[i]])) {
                    obj[ks[i]] = obj2[ks[i]];
                }
            } else if (obj1[ks[i]] !== obj2[ks[i]]) {
                obj[ks[i]] = obj2[ks[i]];
            }
        }
        return obj;
    }

    function objCompare(o, n) {
        var ks = Object.keys(o);
        for (var i = 0; i < ks.length; i++) {
            if (typeof o[ks[i]] == "object") {
                if (objCompare(o[ks[i]], n[ks[i]])) {
                    return true;
                }
            } else {
                if (o[ks[i]] !== n[ks[i]]) {
                    return true;
                }
            }
        }
        return false;
    }

})();