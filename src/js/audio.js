App.AudioApi = (function(){
    "use strict";

    var AudioApi = {};

    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    var audioContext = new window.webkitAudioContext(),

    beatCutOff = 20,
    BEAT_HOLD_TIME = 60, //num of frames to hold a beat
    BEAT_DECAY_RATE = 0.97,
    BEAT_MIN = 0.6, //level less than this is no beat
    recorder, source, analyser, microphone, intervalId, freqByteData, audioStream,
    audioConstraints = {
        audio: true,
        video: false
    },
    normLevel = 0,
    maxLevel = 0,
    volSens = 4.0,
    beatTime = 30; //avoid auto beat at start

    AudioApi.record = function(){
        navigator.getMedia(audioConstraints, function(stream) {
            App.timer.start();

            audioStream = stream;

            console.log("stream:", stream);

            source = audioContext.createBufferSource();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 1024;
            freqByteData = new Uint8Array(analyser.frequencyBinCount);

            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            intervalId = window.setInterval(updateAudio, 150);
        }, function() {
            console.log("error:", arguments);
        });
    };

    var stopRecording = function(){
        App.timer.stop();
        audioStream.stop();
        window.clearInterval(intervalId);
    };

    var updateAudio = function(){
        analyser.getByteFrequencyData(freqByteData);

        var length = freqByteData.length;

        //GET AVG LEVEL
        var sum = 0;
        for(var j = 0; j < length; ++j) {
            sum += freqByteData[j];
        }

        // Calculate the average frequency of the samples in the bin
        var aveLevel = sum / length;

        normLevel = (aveLevel / 256) * volSens; //256 is the highest a freq data can be
        if(normLevel > maxLevel){
            maxLevel = normLevel;
        }
        console.log("max:", maxLevel, "norm:", normLevel);

        if(maxLevel > 1.5){
            stopRecording();
        }

        //BEAT DETECTION
        if (normLevel  > beatCutOff && normLevel > BEAT_MIN){
            beatCutOff = normLevel *1.1;
            beatTime = 0;
        }
        else{
            if (beatTime < BEAT_HOLD_TIME){
                beatTime ++;
            }
            else{
                beatCutOff *= BEAT_DECAY_RATE;
            }
        }
    };

    return AudioApi;
}).call(this);