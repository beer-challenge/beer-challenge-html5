//(function(){
    var timer = {
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
            _model.set(this.elapsed());
        },

        start: function(){
            _model = Bacon.Model();

            _model.changes()
            .map(function(val) {
                return (Math.floor(val/100) * 0.1).toFixed(1)
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
    _.bindAll(timer);

    var foo = console.log;
    console.log = function(){
        var txt = "";
        _.each(arguments, function(arg){
            txt += " " + arg;
        });
        $('#log').html(txt + "\n");
        foo.apply(console, arguments);
    }

    var handleOrientation = function(event) {
        var x = event.beta;  // In degree in the range [-180,180]
        var y = event.gamma; // In degree in the range [-90,90]

        console.log( "beta : " + x + "---" + y +" \n");
    };
    var throttledHandleOrientation = _.throttle(handleOrientation, 50);
    window.addEventListener('deviceorientation', throttledHandleOrientation);

    //var recordRTC = RecordRTC(mediaStream);
    

    var recorder;
    var record = function(){
        var audioStream;
    
        if (!audioStream){
            var audioConstraints = {
                audio: true,
                video: false
            };
            navigator.getUserMedia(audioConstraints, function(stream) {
                console.log("stream:", stream);
                
                if (window.IsChrome) stream = new window.MediaStream(stream.getAudioTracks());
                audioStream = stream;

                audio.src = URL.createObjectURL(audioStream);
                audio.play();

                // "audio" is a default type
                recorder = window.RecordRTC(stream, {
                    type: 'audio'
                });
                recorder.startRecording();
            }, function() {});
        }
        else {
            audio.src = URL.createObjectURL(audioStream);
            audio.play();
            if (recorder) recorder.startRecording();
        }
    };

    $("#timer-toggle-btn")
    .asEventStream("click")
    .map(function(event) {
        if(timer.isRunning()){
            timer.stop();
            recorder.stopRecording(function(audioURL) {
                var mediaElement = $('#audio')[0];
                mediaElement.src = audioURL;
            });
        }
        else{
            timer.start();
            record();
        }
        console.log("timer is running:", timer.isRunning());
        return timer.isRunning()? 'Stop': 'Start';
    })
    .assign($("#timer-toggle-btn"), "text")

    $("#log-btn")
    .asEventStream("click")
    .subscribe(function(){
        console.log("??");
        $('#log').addClass("animated slideInDown"); //.removeClass("display-none")
    });

//}).call(this);