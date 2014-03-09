/** @jsx React.DOM */
(function(){
    "use strict";

    App.render = function(){
        console.log("--",App.Components.BeerAppLayout)
        
        React.renderComponent(
            BeerAppLayout( {time:App.Timer.getElapsedModel(), state:App.Timer.getStateModel()}),
            document.getElementById('app')
        );
    };

    App.Timer.init();
}).call(this);