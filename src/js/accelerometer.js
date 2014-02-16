App.Accelerometer = (function(){
    "use strict";

    var Accelerometer = {};

    var _hitStatus = null;

    var handleOrientation = function(event) {
        /*
        var x = event.beta;  // In degree in the range [-180,180]
        var y = event.gamma; // In degree in the range [-90,90]
        console.log( "beta : " + x + "---" + y +" \n");
        */

        _hitStatus = new Date().getTime();
    };

    var throttledHandleOrientation = _.throttle(handleOrientation, 10);
    
    Accelerometer.start = function(){
        _hitStatus = false;
        window.setTimeout(function(){
            window.addEventListener('deviceorientation', throttledHandleOrientation);
        }, 2000);
    };

    Accelerometer.stop = function(){
        window.removeEventListener('deviceorientation', throttledHandleOrientation);
    };

    Accelerometer.status = function(){
        return _hitStatus;
    };

    return Accelerometer; 
}).call(this);