App.Audio = (function(){
    "use strict";

    var Audio = {};

    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    var audioContext = new window.webkitAudioContext(),

    beatCutOff = 0,
    BEAT_HOLD_TIME = 20, //num of frames to hold a beat
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

    Audio.record = function(){
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

            intervalId = window.setInterval(updateAudio, 50);
        }, function() {
            console.log("error:", arguments);
        });
    };

    Audio.stopRecording = function(){
        App.timer.stop();
        audioStream.stop();
        window.clearInterval(intervalId);
    };

    /*
    var foo = function(){
        var myWorker = new Worker("js/worker.js");

        myWorker.addEventListener("message", function (oEvent) {
          console.log("Called back by the worker!" + oEvent.data);
        }, false);
        

        analyser.getByteFrequencyData(freqByteData);
        myWorker.postMessage(freqByteData); 
    };
    */

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
        //console.log("max:", maxLevel, "norm:", normLevel);

        var now = new Date().getTime();
        var diff = now - App.Accelerometer.status();

        if(beatCutOff > 0.5 && diff < 50){
            console.log("audio", beatCutOff, "diff:", diff);
            Audio.stopRecording();
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

    Audio.getCurrentLevel = function(){
        return beatCutOff;
    };

    return Audio;
}).call(this);