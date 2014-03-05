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
            BeerApp( {time:App.Timer.getElapsedModel(), state:App.Timer.getStateModel()}),
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

    var TimerButton = React.createClass({displayName: 'TimerButton',
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
                React.DOM.div( {id:"timer-btn", className:this.props.state.get(), onTouchEnd:App.Timer.start, onTouchStart:this.onTouchStart, onTouchCancel:this.onTouchCancel}, 
                    React.DOM.div( {className:"text-container"}, 
                      React.DOM.div( {className:"text"}, buttonText)
                    ),
                
                    React.DOM.div( {className:"bg-hex hexagon"}, 
                      React.DOM.div( {className:"hex"},    
                        React.DOM.div( {className:"corner-1"}),
                        React.DOM.div( {className:"corner-2"})    
                      )
                    ),

                    React.DOM.div( {className:"front-hex hexagon"}, 
                      React.DOM.div( {className:"hex"},    
                        React.DOM.div( {className:"corner-1"}),
                        React.DOM.div( {className:"corner-2"})    
                      )
                    )
                )
            );
        }
    });

    var Logo = React.createClass({displayName: 'Logo',
        render: function() {
            return (
                React.DOM.div( {className:"logo"}, 
                    React.DOM.div( {className:"top"}, "The"),
                    React.DOM.div( {className:"middle"}, "Beer"),
                    React.DOM.div( {className:"bottom"}, "Challenge")
                )
            );
        }
    });

    var BottomHelp = React.createClass({displayName: 'BottomHelp',
        onTouchStart: function(){
            App.Timer.setState(App.States.front);
        },
        render: function() {
            if(this.props.state.get() === App.States.end){
                return (
                    React.DOM.div( {className:"bottom-help"}, React.DOM.button( {id:"try-again-btn", onTouchStart:this.onTouchStart}, "Try again"))
                );
            }
            else{
                return (
                    React.DOM.div( {className:"bottom-help"}, "slam to stop")
                );    
            }
        }
    });

    var Counter = React.createClass({displayName: 'Counter',
        render: function() {
            var time = this.props.time.get();
            var progress = {
                seconds: (Math.floor(time/100) * 0.1).toFixed(0),
                fractions: window.parseInt(time.toString().slice(-3), 10)/100
            };

            var progressText = pages[this.props.state.get()].progressText

            return (
                React.DOM.div( {id:"counter"}, 
                    React.DOM.div( {className:"text"}, progressText),
                    React.DOM.div( {className:"progress-seconds"}, 
                        progress.seconds,
                        React.DOM.div( {className:"progress-fractions"}, progress.fractions)
                    )
                )
            );
        }
    });


    var BeerApp = React.createClass({displayName: 'BeerApp',
        getInitialState: function(){
            var self = this;
            return {
                pages: {
                    front: function(){
                        return (
                            React.DOM.div(null, 
                                Logo(null ),
                                TimerButton( {state:self.props.state} )
                            )
                        );
                    },
                    ready: function(){
                        return (
                            React.DOM.div(null, 
                                Counter( {time:self.props.time, state:self.props.state}),
                                TimerButton( {state:self.props.state} )
                            )
                        );
                    },
                    progress: function(){
                        return (
                            React.DOM.div(null, 
                                Counter( {time:self.props.time, state:self.props.state}),
                                BottomHelp( {state:self.props.state})
                            )
                        );
                    },
                    end: function(){
                        return (
                            React.DOM.div(null, 
                                Counter( {time:self.props.time, state:self.props.state}),
                                BottomHelp( {state:self.props.state})
                            )
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
               React.DOM.div( {id:"page"}, currentPage.page)
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