window.App = (function(){
    "use strict";

    var App = {};

    window.onerror = function(msg, url, line) {
       console.log("Error: " + msg + "\nurl: " + url + "\nline #: " + line);
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

    function render() {
        React.renderComponent(
            <BeerApp model={App.timer.getElapsedModel()}/>,
            document.getElementById('app')
        );
    }

    var TimerButton = React.createClass({
        getInitialState: function(){
            return {
                buttonText: "press & hold"
            };
        },
        toggleTimer: function(event){
            if(this.props.running){
                App.Audio.stopRecording();
                App.Accelerometer.stop();
            }
            else{
                App.Audio.record();
                App.Accelerometer.start();
            }

            this.props.handleUserInput(!this.props.running);
        },

        buttonDown: function(event){
            this.setState({buttonText: "Release now"});
        },

        render: function() {
            return (
                <div id="timer-btn-container" onTouchEnd={this.toggleTimer} onTouchStart={this.buttonDown}>
                    <div className="text-container">
                      <div className="text">{this.state.buttonText}</div>
                    </div>
                
                    <div className="bg-hex">
                      <div className="hex">   
                        <div className="corner-1">jee</div>
                        <div className="corner-2"></div>    
                      </div>
                    </div>

                    <div id="timer-toggle-btn">
                      <div className="hex">   
                        <div className="corner-1"></div>
                        <div className="corner-2"></div>    
                      </div>
                    </div>
                </div>
            );
        }
    });

    var Logo = React.createClass({
        render: function() {
            return (
                <div className="logo">
                    <div className="top">The</div>
                    <div className="middle">Beer</div>
                    <div className="bottom">Challenge</div>
                </div>
            );
        }
    });

    var Counter = React.createClass({
        render: function() {
            var val = this.props.time.get();
            var time = {
                seconds: (Math.floor(val/100) * 0.1).toFixed(0),
                fractions: window.parseInt(val.toString().slice(-3), 10)/100
            };

            return (
                <div id="counter">
                    <div className="text">{'Ready when you are'}</div>
                    <div className="progress-seconds">
                        {time.seconds}
                        <div className="progress-fractions">{time.fractions}</div>
                    </div>
                </div>
            );
        }
    });


    var BeerApp = React.createClass({
        getInitialState: function(){
            return {
                pages: {
                    front: function(running, handleUserInput){
                        return (
                            <div>
                                <Logo />
                                <TimerButton running={running} handleUserInput={handleUserInput}/>
                            </div>
                        );
                    },
                    progress: function(time, state){
                        return (
                            <div>
                                <Counter time={time}/>
                            </div>
                        );
                    },
                },
                running: false
            }
        },

        handleUserInput: function(running) {
            this.setState({running: running});
        },

        render: function() {
            var front = this.state.pages.front(this.state.running, this.handleUserInput);
            var progress = this.state.pages.progress(this.props.model)


            var currentPage, color;
            if(!this.state.running){
                currentPage = front;
                color = "red";
            }
            else{
                currentPage = progress;
                color = "green";
            }

            $('html').attr("data-bg-color", color);

            return (
               <div id="page">{currentPage}</div>
            );
        }
    });

    App.timer = {
        _intervalId: null,
        _elapsedModel: Bacon.Model(),
        _stateModel: Bacon.Model(),

        init: function(){
            this._elapsedModel.set(0);
            // this._elapsedModel.changes()
            // .map(function(val) {
            //     return (Math.floor(val/100) * 0.1).toFixed(1);
            // })
            // .assign($("#timer-output"), "text");
        },

        updateModel: function(){
            this._elapsedModel.set(this._elapsedModel.get() + 100);
            render();
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

        getElapsedModel: function(){
            return this._elapsedModel;
        },

        getStateModel: function(){
            return this._stateModel;
        }
    };
    _.bindAll(App.timer);
    App.timer.init();


    // $("#timer-btn-container")
    // .asEventStream("click")
    // .subscribe(function(event) {
    //     alert("start");
    //     App.Audio.record();
    //     App.Accelerometer.start();
    // });

    // App.timer.getStateModel().changes()
    // .map(function(val) {
    //     return !val? "inline-block": "none";
    // })
    // .assign($("#timer-toggle-btn"), "css", "display");

    /*
    $("#log-btn")
    .asEventStream("click")
    .subscribe(function(){
        $('#log').addClass("animated slideInDown"); //.removeClass("display-none")
    });
    */

    render();

    return App;
}).call(this);