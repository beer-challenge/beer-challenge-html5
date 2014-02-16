(function(){
"use strict";

//postMessage("I\'m working before postMessage(\'ali\').");

onmessage = function (oEvent) {
    //console.log("??" + oEvent.data);
    //postMessage("Hi " + oEvent.data);

    updateAudio(oEvent.data);
};

var beatCutOff = 0,
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

var updateAudio = function(freqByteData){
    //analyser.getByteFrequencyData(freqByteData);

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
    //console.log("max:", maxLevel, "norm:", normLevel, "beatCutOff:", beatCutOff, "beatTime:", beatTime);
    //console.log(beatCutOff, "--", beatTime);

    /*
    if(maxLevel > 1.5 && App.Accelerometer.status()){
        stopRecording();
    }
    */

    if(beatCutOff > 1){
        console.log("audio", beatCutOff);
    }

    //console.log("audio", beatCutOff);

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

}).call(this);