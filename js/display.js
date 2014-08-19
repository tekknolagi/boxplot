Display = {
    width:  600,
    height: 340,
};

Display.Active = function (display) { };

Display.Active.prototype = {
    create: function () {
	window.addEventListener("storage", function () {
	    this.draw();
	}, false);
    },

    update: function () {
	console.log("update");
    },

    draw: function () {
	console.log("draw!");
    },
};

var display = new Phaser.Game(Display.width, Display.height, Phaser.AUTO, 'display');

display.state.add('active', Display.Active);
display.state.start('active');
