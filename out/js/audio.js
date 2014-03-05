App.Audio = (function(){
    "use strict";

    var Audio = {};

    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    var audioContext = new window.webkitAudioContext(),
    normLevel = 0,
    volSens = 4.0,
    
    recorder, source, analyser, microphone, intervalId, freqByteData, audioStream,
    audioConstraints = {
        audio: true,
        video: false
    };

    Audio.record = function(callback){
        navigator.getMedia(audioConstraints, function(stream) {
            console.log("record, stream:", stream);

            source = audioContext.createBufferSource();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 1024;
            freqByteData = new Uint8Array(analyser.frequencyBinCount);

            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            intervalId = window.setInterval(updateAudio, 50);

            if(callback){
                callback();
            }
        }, function() {
            console.log("error:", arguments);
        });
    };

    Audio.stopRecording = function(){
        if(audioStream){
            audioStream.stop();    
        }
        window.clearInterval(intervalId);
    };

    var updateAudio = function(){
        analyser.getByteFrequencyData(freqByteData);

        var length = freqByteData.length;

        var sum = 0;
        for(var j = 0; j < length; ++j) {
            sum += freqByteData[j];
        }

        // Calculate the average frequency of the samples in the bin
        var aveLevel = sum / length;

        normLevel = (aveLevel / 256) * volSens; //256 is the highest a freq data can be

        var now = window.App.getTime();
        var diff = now - App.Accelerometer.status();
        if(normLevel > 0.2 && diff < 250){
            console.log("audio", normLevel, "diff:", diff);
            App.Timer.stop();
        }
    };

    return Audio;
}).call(this);