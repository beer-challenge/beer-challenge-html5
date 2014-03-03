/** @jsx React.DOM */
window.App = (function(){
    "use strict";

    var App = {};

    function render() {
        React.renderComponent(
            BeerApp( {time:App.Timer.getElapsedModel(), status:App.Timer.getStateModel()}),
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
        getInitialState: function(){
            return {
                buttonText: "press & hold"
            };
        },

        buttonDown: function(event){
            this.setState({buttonText: "Release now"});
        },

        render: function() {
            return (
                React.DOM.div( {id:"timer-btn-container", onTouchEnd:App.Timer.start, onTouchStart:this.buttonDown}, 
                    React.DOM.div( {className:"text-container"}, 
                      React.DOM.div( {className:"text"}, this.state.buttonText)
                    ),
                
                    React.DOM.div( {className:"bg-hex"}, 
                      React.DOM.div( {className:"hex"},    
                        React.DOM.div( {className:"corner-1"}, "jee"),
                        React.DOM.div( {className:"corner-2"})    
                      )
                    ),

                    React.DOM.div( {id:"timer-toggle-btn"}, 
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

    var Counter = React.createClass({displayName: 'Counter',
        render: function() {
            var val = this.props.time.get();
            var time = {
                seconds: (Math.floor(val/100) * 0.1).toFixed(0),
                fractions: window.parseInt(val.toString().slice(-3), 10)/100
            };

            return (
                React.DOM.div( {id:"counter"}, 
                    React.DOM.div( {className:"text"}, 'Ready when you are'),
                    React.DOM.div( {className:"progress-seconds"}, 
                        time.seconds,
                        React.DOM.div( {className:"progress-fractions"}, time.fractions)
                    )
                )
            );
        }
    });


    var BeerApp = React.createClass({displayName: 'BeerApp',
        getInitialState: function(){
            return {
                pages: {
                    front: function(running){
                        return (
                            React.DOM.div(null, 
                                Logo(null ),
                                TimerButton( {running:running} )
                            )
                        );
                    },
                    progress: function(time, state){
                        return (
                            React.DOM.div(null, 
                                Counter( {time:time})
                            )
                        );
                    },
                },
                running: false
            }
        },

        render: function() {
            var front = this.state.pages.front(this.props.status);
            var progress = this.state.pages.progress(this.props.time)

            var currentPage, color;
            if(!this.props.status.get()){
                currentPage = front;
                color = "red";
            }
            else{
                currentPage = progress;
                color = "green";
            }

            //console.log("currentPage:", currentPage, "color:", color);

            $('html').attr("data-bg-color", color);

            return (
               React.DOM.div( {id:"page"}, currentPage)
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
            this._stateModel.set(false)
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
                self._stateModel.set(true)
                self._intervalId = window.setInterval(self.updateModel, 100);
                App.Accelerometer.start();
            });
        },

        stop: function(){
            console.log("timer: stop");
            window.clearInterval(this._intervalId);

            this._stateModel.set(false)

            App.Accelerometer.stop();
            App.Audio.stopRecording();   
        },

        getElapsedModel: function(){
            return this._elapsedModel;
        },

        getStateModel: function(){
            return this._stateModel;
        },
    };
    _.bindAll(App.Timer);
    App.Timer.init();

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