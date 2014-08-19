var Display = {
    width:  600,
    height: 340,
    line_width: 2,
    box_height: 50,
};

var plot = {
    min:       undefined,
    q1:        undefined,
    average:   undefined,
    median:    undefined,
    q3:        undefined,
    max:       undefined,
    range: function () {
	return this.max - this.min;
    },
};

Display.Active = function (display) { };

Display.Active.prototype = {
    create: function () {
	display.stage.backgroundColor = "#fcc";
	display.graphics = display.add.graphics(0, 0);
	display.graphics.lineStyle(2, 0x000000, 1);
	
	window.addEventListener("storage", function () {
	    this.calculate();
	    this.draw();
	}, false);

	this.calculate();
	this.draw();
    },

    update: function () {
//	this.calculate();
//	this.draw();
    },

    calculate: function () {
	var arr = [];
	for (var s in localStorage) {
	    if (s.substring(0, 3) === "ss_") {
		arr.push(localStorage[s]);
	    }
	}

	arr = arr.sort(function(a, b){return a-b}); // sort numerically

	plot.min = 2;
	plot.q1  = 3;
	plot.average = 4;
	plot.median  = 4;
	plot.q3  = 6;
	plot.max = 7;
    },
    
    draw: function () {
	var plot_pixels = {};
	for (e in plot) {
	    plot_pixels[e] = this.to_pixels(plot[e]);
	}

	this.draw_line(0, Display.height / 2, plot_pixels.q1, Display.height / 2);
	this.draw_line(plot_pixels.q3, Display.height / 2, Display.width, Display.height / 2);

	this.draw_line(1, Display.height / 2 + Display.box_height, 1, Display.height / 2 - Display.box_height);
	this.draw_line(Display.width - 1, Display.height / 2 + Display.box_height, Display.width - 1, Display.height / 2 - Display.box_height);


	display.graphics.drawRect(plot_pixels.q1, Display.height / 2 - Display.box_height, plot_pixels.median - plot_pixels.q1, Display.box_height * 2);
	display.graphics.drawRect(plot_pixels.q1, Display.height / 2 - Display.box_height, plot_pixels.q3 - plot_pixels.q1, Display.box_height * 2);

    },

    draw_line: function (x1, y1, x2, y2) {
	display.graphics.moveTo(x1, y1);
	display.graphics.lineTo(x2, y2);
    },

    to_pixels: function (x) {
	return  ((x - plot.min) / plot.range()) * Display.width;
    },

    quartile: function (arr, q) { // q should be 0, 1, 2, 3, or 4
	var index = q * 0.25 * (arr.length - 1);
	console.log(index);
	
	switch (index % 1) {
	case 0:
	    return arr[index];
	case 0.25:
	    return (arr[Math.floor(index)] * 3 + arr[Math.ceil(index)]) / 4
	case 0.5:
	    return (arr[Math.floor(index)] + arr[Math.ceil(index)]) / 2;
	case 0.75:
	    return (arr[Math.floor(index)] + arr[Math.ceil(index)] * 3) / 4
	}
    },

};

var display = new Phaser.Game(Display.width, Display.height, Phaser.AUTO, 'display');

display.state.add('active', Display.Active);
display.state.start('active');
