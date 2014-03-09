/** @jsx React.DOM */
window.App.Components = (function(){
    "use strict";

    var Components = {};

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

    var Menu = React.createClass({displayName: 'Menu',
        getInitialState: function(){
            return {
                visible: false,
                audio: App.Settings.audioThreshold,
                acc: App.Settings.accelerometerThreshold,
                diff: App.Settings.diff
            };
        },
        toggleMenu: function(event){
            this.setState({
                visible: !this.state.visible
            })
        },

        handleAudioChange: function(event){
            var val = window.parseFloat(event.target.value);
            if(val && (val > 0.01 || val < 1.0)){
                this.setState({
                    audio: val
                });

                App.Settings.audioThreshold = val;
            }
        },

        handleAccelerometerChange: function(event){
            var val = window.parseFloat(event.target.value);
            if(val && (val > 0.01 || val < 1.0)){
                this.setState({
                    acc: val
                });

                App.Settings.accelerometerThreshold = val;
            }
        },

        handleDiffChange: function(event){
            var val = window.parseInt(event.target.value);
            if(val && (val > 1 || val < 500)){
                this.setState({
                    diff: val
                });

                App.Settings.diff = val;
            }
        },

        render: function(){
            return (
                React.DOM.div( {id:"menu", className:'visible-' + this.state.visible}, 
                    React.DOM.button( {onTouchStart:this.toggleMenu}, "menu"),
                    React.DOM.div( {className:"content"}, 
                        "audio threshold: ", React.DOM.input( {className:"audio", value:this.state.audio, onChange:this.handleAudioChange} ),
                        "accelerometer threshold: ", React.DOM.input( {className:"acc", value:this.state.acc, onChange:this.handleAccelerometerChange} ),
                        "audio/acc diff: ", React.DOM.input( {className:"diff", value:this.state.diff, onChange:this.handleDiffChange} )
                    )
                )
            );
        }
    });

    var TimerButton = React.createClass({displayName: 'TimerButton',
        onTouchStart: function(event){
            App.Timer.setState(App.States.ready);
            this.el = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
        },

        onTouchCancel: function(event){
            App.Timer.setState(App.States.front);
        },

        onTouchMove: function(event){
            var el = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
            if(this.el != el){
                App.Timer.setState(App.States.front);
            }
        },

        render: function() {
            var buttonText = pages[this.props.state.get()].timerButtonText 

            return (
                React.DOM.div( {id:"timer-btn", className:this.props.state.get()}, 
                    React.DOM.div( {className:"timer-btn-container", onTouchEnd:App.Timer.start, onTouchStart:this.onTouchStart, onTouchMove:this.onTouchMove, onTouchCancel:this.onTouchCancel}, 
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

    var HighscoreEntry = React.createClass({displayName: 'HighscoreEntry',
        render: function(){
            return (
                React.DOM.div( {className:"entry"}, 
                    React.DOM.div( {className:"place"}, this.props.place),
                    React.DOM.div( {className:"name"}, this.props.name),
                    React.DOM.div( {className:"time"}, this.props.time)
                )
            );
        }
    });

    var Highscore = React.createClass({displayName: 'Highscore',
        render: function() {
            var rows = [];

            var place = 1;
            App.Utils.getTestHighScores().list.forEach(function(entry){
                rows.push(HighscoreEntry( {name:entry.name, time:entry.time, place:place}));
                ++place;
            });

            return (
                React.DOM.div( {id:"highscore"}, 
                    React.DOM.div( {className:"title"}, "todays best"),
                    rows
                )
            );
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
                                Menu(null ),
                                Logo(null )
                            )
                        );
                    },
                    ready: function(){
                        return (
                            React.DOM.div(null, 
                                Counter( {time:self.props.time, state:self.props.state})
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
                                BottomHelp( {state:self.props.state}),
                                Highscore(null)
                            )
                        );
                    }
                }
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

    var BeerAppLayout = React.createClass({displayName: 'BeerAppLayout',
        render: function() {
            return (
                React.DOM.div(null, 
                    TimerButton( {state:this.props.state} ),
                    BeerApp( {time:App.Timer.getElapsedModel(), state:App.Timer.getStateModel()})
                )
            );
        }
    });
    window.BeerAppLayout = BeerAppLayout;

    return Components;

}).call(this);
