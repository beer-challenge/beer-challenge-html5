/** @jsx React.DOM */
window.App = (function(){
    "use strict";

    var App = {};

    App.States = {
        front: "FRONT",
        ready: "READY",
        progress: "PROGRESS",
        end: "END"
    };

    App.Settings = {
        audioThreshold: 0.2,
        diff: 250,
        accelerometerThreshold: 0.15
    };

    $(window).keyup(function(event){
        var charTyped = String.fromCharCode(event.keyCode);
        if(charTyped === "S"){
            App.Timer.start();
        }
        else if(charTyped === "E"){
            App.Timer.stop();
        }
        //console.log("e", event, charTyped);
    });

    React.initializeTouchEvents(true);

    App.Timer = {
        _intervalId: null,
        _elapsedModel: Bacon.Model(),
        _stateModel: Bacon.Model(),

        init: function(){
            console.log("App.Timer init");
            this._elapsedModel.set(0);
            this._stateModel.set(App.States.front);
            App.render();
        },

        updateModel: function(){
            this._elapsedModel.set(this._elapsedModel.get() + 100);
            App.render();
        },

        start: function(){
            console.log("timer: start");
            
            var self = this;
            App.Audio.record(function(){
                console.log("timer, audio callback");
                self._elapsedModel.set(0);
                self._stateModel.set(App.States.progress);
                self._intervalId = window.setInterval(self.updateModel, 100);
                App.Accelerometer.start();
            });
        },

        stop: function(){
            console.log("timer: stop");
            window.clearInterval(this._intervalId);

            App.Timer.setState(App.States.end);

            App.Accelerometer.stop();
            App.Audio.stopRecording();

            $.post("http://www.beer-challenge.com/highscores", function(data){
                console.log("data", data);
            });

        },

        getElapsedModel: function(){
            return this._elapsedModel;
        },

        getStateModel: function(){
            return this._stateModel;
        },

        setState: function(state){
            console.log("setState:", state);
            this._stateModel.set(state);
            App.render();
        }
    };
    _.bindAll(App.Timer);

    return App;
}).call(this);