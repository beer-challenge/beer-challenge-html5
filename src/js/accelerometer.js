App.Accelerometer = (function(){
    "use strict";

    var Accelerometer = {};

    var hitStatus = null;
    var prevMotionX = null;
    var accelerometerStartTime = null;
    var deviceorientation = false;

    var orientationHasChanged = function(val, prevVal, limit){
        if(!prevVal){
            return false;
        }

        return (val > prevVal * (1+limit) || val < prevVal * (1-limit));
    }

    var handleMotionChange = function(event) {
        var x = event.accelerationIncludingGravity.x;
        if(orientationHasChanged(x, prevMotionX, 0.4) && App.Utils.getTime() > (accelerometerStartTime + 1500) ){
            hitStatus = App.Utils.getTime();
            //console.log("handleMotionChange, hitStatus:", hitStatus);
        }

        prevMotionX = x;
    };

    var handleOrientation = function(event) {
        deviceorientation = true;

        if(orientationHasChanged(event.beta, prevMotionX, App.Settings.accelerometerThreshold) && App.Utils.getTime() > (accelerometerStartTime + 1500)){
            hitStatus = App.Utils.getTime();
            //console.log("handleOrientation, hitStatus:", hitStatus);
        }

        prevMotionX = event.beta;
    };

    var throttledHandleOrientation, throttledHandleMotion;
    
    Accelerometer.start = function(){
        hitStatus = false;
        throttledHandleOrientation = _.throttle(handleOrientation, 10);
        throttledHandleMotion = _.throttle(handleMotionChange, 10);
        accelerometerStartTime = App.Utils.getTime();
        console.log("Accelerometer start");

        window.addEventListener('deviceorientation', throttledHandleOrientation);

        window.setTimeout(function(){
            if(!deviceorientation){
                console.log("not receiving any accelerometer data, switching to motion");
                window.removeEventListener('deviceorientation', throttledHandleOrientation);
                window.addEventListener("devicemotion", throttledHandleMotion, true);
            }
        }, 500)
    };

    Accelerometer.stop = function(){
        window.removeEventListener('deviceorientation', throttledHandleOrientation);
        window.removeEventListener('devicemotion', throttledHandleOrientation);
    };

    Accelerometer.status = function(){
        return hitStatus;
    };

    return Accelerometer; 
}).call(this);