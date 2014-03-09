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

    Utils.getTime = function(){
        return new Date().getTime();
    };

    Utils.getTestHighScores = function(){
        return {
            list: [
              { name: 'yue', time: '1.1' },
              { name: 'rgd', time: '1.2' },
              { name: 'lop', time: '2.0' },
              { name: 'xxx', time: '2.2' },
              { name: 'lui', time: '3.1' },
              { name: 'wer', time: '7.3' },
              { name: 'bvn', time: '12.1' },
              { name: 'iuo', time: '111.1' },
              { name: 'iop', time: '123.0' },
              { name: 'rte', time: '221.8' },
            ],
            type: '24h'
        };
    };
    
    return Utils;

}).call(this);