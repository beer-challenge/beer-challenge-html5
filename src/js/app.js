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

    $("#timer-toggle-btn")
    .asEventStream("click")
    .map(function(event) {
        timer.isRunning()? timer.stop() : timer.start();
        return timer.isRunning()? 'Stop': 'Start';
    })
    .assign($("#timer-toggle-btn"), "text")
//}).call(this);