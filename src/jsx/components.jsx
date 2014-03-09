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

    var Menu = React.createClass({
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
                <div id="menu" className={'visible-' + this.state.visible}>
                    <button onTouchStart={this.toggleMenu}>menu</button>
                    <div className="content">
                        audio threshold: <input className="audio" value={this.state.audio} onChange={this.handleAudioChange} />
                        accelerometer threshold: <input className="acc" value={this.state.acc} onChange={this.handleAccelerometerChange} />
                        audio/acc diff: <input className="diff" value={this.state.diff} onChange={this.handleDiffChange} />
                    </div>
                </div>
            );
        }
    });

    var TimerButton = React.createClass({
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
                <div id="timer-btn" className={this.props.state.get()}>
                    <div className="timer-btn-container" onTouchEnd={App.Timer.start} onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove} onTouchCancel={this.onTouchCancel}>
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

    var HighscoreEntry = React.createClass({
        render: function(){
            return (
                <div className="entry">
                    <div className="place">{this.props.place}</div>
                    <div className="name">{this.props.name}</div>
                    <div className="time">{this.props.time}</div>
                </div>
            );
        }
    });

    var Highscore = React.createClass({
        render: function() {
            var rows = [];

            var place = 1;
            App.Utils.getTestHighScores().list.forEach(function(entry){
                rows.push(<HighscoreEntry name={entry.name} time={entry.time} place={place}/>);
                ++place;
            });

            return (
                <div id="highscore">
                    <div className="title">todays best</div>
                    {rows}
                </div>
            );
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
                                <Menu />
                                <Logo />
                            </div>
                        );
                    },
                    ready: function(){
                        return (
                            <div>
                                <Counter time={self.props.time} state={self.props.state}/>
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
                                <Highscore/>
                            </div>
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
               <div id="page">{currentPage.page}</div>
            );
        }
    });

    var BeerAppLayout = React.createClass({
        render: function() {
            return (
                <div>
                    <TimerButton state={this.props.state} />
                    <BeerApp time={App.Timer.getElapsedModel()} state={App.Timer.getStateModel()}/>
                </div>
            );
        }
    });
    window.BeerAppLayout = BeerAppLayout;

    return Components;

}).call(this);
