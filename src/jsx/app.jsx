window.App = (function(){
    "use strict";

    var App = {};

    App.States = {
        front: "FRONT",
        ready: "READY",
        progress: "PROGRESS",
        end: "END"
    };

    function render() {
        React.renderComponent(
            <BeerApp time={App.Timer.getElapsedModel()} state={App.Timer.getStateModel()}/>,
            document.getElementById('app')
        );
    }

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

    var TimerButton = React.createClass({
        onTouchStart: function(event){
            App.Timer.setState(App.States.ready);
        },

        onTouchCancel: function(event){
            console.log("touch cancel");
            App.Timer.setState(App.States.front);
        },

        render: function() {
            var buttonText = "tap & hold";

            if(this.props.state.get() === App.States.ready){
                buttonText = "release now";
            }

            return (
                <div id="timer-btn" className={this.props.state.get()} onTouchEnd={App.Timer.start} onTouchStart={this.onTouchStart} onTouchCancel={this.onTouchCancel}>
                    <div className="text-container">
                      <div className="text">{buttonText}</div>
                    </div>
                
                    <div className="bg-hex hexagon">
                      <div className="hex">   
                        <div className="corner-1"></div>
                        <div className="corner-2"></div>    
                      </div>
                    </div>

                    <div className="front-hex hexagon">
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

    var BottomHelp = React.createClass({
        render: function() {
            return (
                <div className="bottom-help">slam top stop</div>
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
                    front: function(state){
                        return (
                            <div>
                                <Logo />
                                <TimerButton state={state} />
                            </div>
                        );
                    },
                    ready: function(time, state){
                        return (
                            <div>
                                <Counter time={time}/>
                                <TimerButton state={state} />
                            </div>
                        );
                    },
                    progress: function(time, state){
                        return (
                            <div>
                                <Counter time={time}/>
                                <BottomHelp />
                            </div>
                        );
                    }
                },
                running: false
            }
        },

        render: function() {
            var pages = {};

            pages[App.States.front] = {
                page: this.state.pages.front(this.props.state),
                color: "red"
            };

            pages[App.States.ready] = {
                page: this.state.pages.ready(this.props.time, this.props.state),
                color: "green"
            };

            pages[App.States.progress] = {
                page: this.state.pages.progress(this.props.time, this.props.state),
                color: "green"
            };

            var currentPage = pages[this.props.state.get()];
            
            //console.log("currentPage:", currentPage, "color:", color);

            $('html').attr("data-bg-color", currentPage.color);

            return (
               <div id="page">{currentPage.page}</div>
            );
        }
    });

    

    App.Timer = {
        _intervalId: null,
        _elapsedModel: Bacon.Model(),
        _stateModel: Bacon.Model(),

        init: function(){
            console.log("App.Timer init");
            this._elapsedModel.set(0);
            this._stateModel.set(App.States.front);
            render();
        },

        updateModel: function(){
            this._elapsedModel.set(this._elapsedModel.get() + 100);
            render();
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

            this._stateModel.set(App.States.end);

            App.Accelerometer.stop();
            App.Audio.stopRecording();   
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
            render();
        }
    };
    _.bindAll(App.Timer);
    App.Timer.init();

    return App;
}).call(this);