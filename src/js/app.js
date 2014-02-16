window.App = (function(){
    "use strict";

    var App = {};

    window.onerror = function(msg, url, line) {
       // You can view the information in an alert to see things working
       // like so:
       alert("Error: " + msg + "\nurl: " + url + "\nline #: " + line);

       // TODO: Report this error via ajax so you can keep track
       //       of what pages have JS issues

       var suppressErrorAlert = false;
       // If you return true, then error alerts (like in older versions of 
       // Internet Explorer) will be suppressed.
       return suppressErrorAlert;
    };

    App.timer = {
        _startTime: null,
        _intervalId: null,
        _model: null,
        _isRunning: false,

        getMillis: function(){
            return new Date().getTime();
        },

        elapsed: function(){
            return this.getMillis() - this._startTime;
        },

        updateModel: function(){
            this._model.set(this.elapsed());
        },

        start: function(){
            this._model = Bacon.Model();

            this._model.changes()
            .map(function(val) {
                return (Math.floor(val/100) * 0.1).toFixed(1);
            })
            .assign($("#timer-output"), "text");

            this._startTime = this.getMillis();
            this._intervalId = window.setInterval(this.updateModel, 100);
            this._isRunning = true;
        },

        stop: function(){
            window.clearInterval(this._intervalId);
            this._isRunning = false;
        },

        isRunning: function(){
            return this._isRunning;
        }
    };
    _.bindAll(App.timer);

    var foo = console.log;
    console.log = function(){
        var txt = "";
        _.each(arguments, function(arg){
            txt += " " + arg;
        });
        $('#log').html(txt + "\n");
        foo.apply(console, arguments);
    };

    var handleOrientation = function(event) {
        var x = event.beta;  // In degree in the range [-180,180]
        var y = event.gamma; // In degree in the range [-90,90]

        console.log( "beta : " + x + "---" + y +" \n");
    };
    var throttledHandleOrientation = _.throttle(handleOrientation, 50);
    //window.addEventListener('deviceorientation', throttledHandleOrientation);   

    $("#timer-toggle-btn")
    .asEventStream("click")
    .map(function(event) {
        if(App.timer.isRunning()){
            App.timer.stop();
            
        }
        else{
            App.AudioApi.record();
        }
        console.log("timer is running:", App.timer.isRunning());
        return App.timer.isRunning()? 'Stop': 'Start';
    })
    .assign($("#timer-toggle-btn"), "text");

    $("#log-btn")
    .asEventStream("click")
    .subscribe(function(){
        console.log("??");
        $('#log').addClass("animated slideInDown"); //.removeClass("display-none")
    });

    return App;
}).call(this);