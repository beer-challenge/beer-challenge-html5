window.App.Utils = (function(){
    "use strict";

    var Utils = {};

    window.onerror = function(msg, url, line) {
       console.log("Error: " + msg + "\nurl: " + url + "\nline #: " + line);
       var suppressErrorAlert = false;
       return suppressErrorAlert;
    };

    Utils.isTouchDevice = 'ontouchstart' in document.documentElement;

    if(Utils.isTouchDevice){
        var origConsoleLog = console.log;
        console.log = function(){
            var txt = "";
            _.each(arguments, function(arg){
                txt += " " + arg;
            });
            $('#log').prepend(txt + "\n");
            origConsoleLog.apply(console, arguments);
        };
    }

    window.App.getTime = function(){
        return new Date().getTime();
    };
    
    return Utils;

}).call(this);