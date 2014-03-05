window.App = (function(){
    "use strict";

    var App = {};

    App.States = {
        front: "FRONT",
        ready: "READY",
        progress: "PROGRESS",
        end: "END"
    };

    var pages = {};

    pages[App.States.front] = {
        color: "red",
        timerButtonText: "tap & hold"
    };

    pages[App.States.ready] = {
        color: "green",
        timerButtonText: "release now",
        progressText: "ready when you are"
    };

    pages[App.States.progress] = {
        color: "green",
        progressText: "Go!"
    };

    pages[App.States.end] = {
        color: "green"
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
            var buttonText = pages[this.props.state.get()].timerButtonText

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
        onTouchStart: function(){
            App.Timer.setState(App.States.front);
        },
        render: function() {
            if(this.props.state.get() === App.States.end){
                return (
                    <div className="bottom-help"><button id="try-again-btn" onTouchStart={this.onTouchStart}>Try again</button></div>
                );
            }
            else{
                return (
                    <div className="bottom-help">slam to stop</div>
                );    
            }
        }
    });

    var Counter = React.createClass({
        render: function() {
            var time = this.props.time.get();
            var progress = {
                seconds: (Math.floor(time/100) * 0.1).toFixed(0),
                fractions: window.parseInt(time.toString().slice(-3), 10)/100
            };

            var progressText = pages[this.props.state.get()].progressText

            return (
                <div id="counter">
                    <div className="text">{progressText}</div>
                    <div className="progress-seconds">
                        {progress.seconds}
                        <div className="progress-fractions">{progress.fractions}</div>
                    </div>
                </div>
            );
        }
    });


    var BeerApp = React.createClass({
        getInitialState: function(){
            var self = this;
            return {
                pages: {
                    front: function(){
                        return (
                            <div>
                                <Logo />
                                <TimerButton state={self.props.state} />
                            </div>
                        );
                    },
                    ready: function(){
                        return (
                            <div>
                                <Counter time={self.props.time} state={self.props.state}/>
                                <TimerButton state={self.props.state} />
                            </div>
                        );
                    },
                    progress: function(){
                        return (
                            <div>
                                <Counter time={self.props.time} state={self.props.state}/>
                                <BottomHelp state={self.props.state}/>
                            </div>
                        );
                    },
                    end: function(){
                        return (
                            <div>
                                <Counter time={self.props.time} state={self.props.state}/>
                                <BottomHelp state={self.props.state}/>
                            </div>
                        );
                    }
                },
                running: false
            }
        },

        render: function() {
            pages[App.States.front].page = this.state.pages.front();
            pages[App.States.ready].page = this.state.pages.ready();
            pages[App.States.progress].page = this.state.pages.progress();
            pages[App.States.end].page = this.state.pages.end();

            var currentPage = pages[this.props.state.get()] || {};
            
            //console.log("currentPage:", currentPage, this.props.state.get());

            var currentColor = currentPage.color || "green";
            $('html').attr("data-bg-color", currentColor);

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

            App.Timer.setState(App.States.end);

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