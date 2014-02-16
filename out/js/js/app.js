(function(){
    // binding for "left" text field
    var left = Bacon.$.textFieldValue($("#left"))
    // binding for "right" text field
    var right = Bacon.$.textFieldValue($("#right"))
    // make a two-way binding between these two
    right.bind(left)
    // Make a one-way side effect: update label text on changes, uppercase
    right.map(".toUpperCase").changes().assign($("#output"), "text")
    // Add an input stream for resetting the value
    left.addSource($("#reset").asEventStream("click").map(""))


}).call(this);