window.App = (function(){
    "use strict";

    var App = {};

    window.onerror = function(msg, url, line) {
       alert("Error: " + msg + "\nurl: " + url + "\nline #: " + line);
       var suppressErrorAlert = false;
       return suppressErrorAlert;
    };

    var origConsoleLog = console.log;
    console.log = function(){
        var txt = "";
        _.each(arguments, function(arg){
            txt += " " + arg;
        });
        $('#log').prepend(txt + "\n");
        origConsoleLog.apply(console, arguments);
    };

    App.timer = {
        _intervalId: null,
        _elapsedModel: Bacon.Model(),
        _stateModel: Bacon.Model(),

        init: function(){
            this._elapsedModel.changes()
            .map(function(val) {
                return (Math.floor(val/100) * 0.1).toFixed(1);
            })
            .assign($("#timer-output"), "text");
        },

        updateModel: function(){
            this._elapsedModel.set(this._elapsedModel.get() + 100);
        },

        start: function(){
            console.log("timer start");
            this._elapsedModel.set(0);
            this._intervalId = window.setInterval(this.updateModel, 100);
            this._stateModel.set(true);
        },

        stop: function(){
            console.log("timer stop");
            window.clearInterval(this._intervalId);

            this._stateModel.set(false);
        },

        isRunning: function(){
            return this._stateModel.get();
        },

        getStateModel: function(){
            return this._stateModel;
        }
    };
    _.bindAll(App.timer);
    App.timer.init();

    $("#timer-toggle-btn")
    .asEventStream("click")
    .subscribe(function(event) {
        App.Audio.record();
        App.Accelerometer.start();
    });

    App.timer.getStateModel().changes()
    .map(function(val) {
        return !val? "inline-block": "none";
    })
    .assign($("#timer-toggle-btn"), "css", "display");

    /*
    $("#log-btn")
    .asEventStream("click")
    .subscribe(function(){
        $('#log').addClass("animated slideInDown"); //.removeClass("display-none")
    });
    */

    return App;
}).call(this);