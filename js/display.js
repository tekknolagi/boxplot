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
	
	Display.scale_text = {};
	Display.scale_text.left = display.add.text(0, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.right = display.add.text(Display.width, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.right.anchor.x = 1;
	Display.scale_text.q1 = display.add.text(-Display.width, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.q1.anchor.x = 0.5;
	Display.scale_text.median = display.add.text(-Display.width, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.median.anchor.x = 0.5;
	Display.scale_text.q3 = display.add.text(-Display.width, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.q3.anchor.x = 0.5;

	
	this.calculate();
	this.draw();
    },

    calculate: function () {
	var arr = [];
	for (var s in localStorage) {
	    if (s.substring(0, 3) === "ss_" && localStorage[s] !== "" && !isNaN(localStorage[s])) {
		arr.push(localStorage[s]);
	    }
	}

	arr = arr.sort(function(a, b){return a-b}); // sort numerically

	plot.min    = this.quartile(arr, 0);
	plot.q1     = this.quartile(arr, 1);
	plot.median = this.quartile(arr, 2);
	plot.q3     = this.quartile(arr, 3);
	plot.max    = this.quartile(arr, 4);
    },
    
    draw: function () {
	if (display.graphics) {
	    display.graphics.destroy();
	}
	
	display.graphics = display.add.graphics(0, 0);
	display.graphics.lineStyle(2, 0x000000, 1);

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


	display.graphics.lineStyle(1, 0x444444, 1); // scale
	this.draw_line(0, Display.height - 24, Display.width, Display.height - 24);

	Display.scale_text.left.text = plot.min;
	Display.scale_text.right.text = plot.max;
	Display.scale_text.q1.text = plot.q1;
	Display.scale_text.median.text = plot.median;
	Display.scale_text.q3.text = plot.q3;
	
	Display.scale_text.q1.x = plot_pixels.q1;
	Display.scale_text.median.x = plot_pixels.median;
	Display.scale_text.q3.x = plot_pixels.q3;
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

	var val_floor = +arr[Math.floor(index)]; // + unary operators are to cast strings to numbers
	var val_ceil  = +arr[Math.ceil(index)];

	switch (index % 1) {
	case 0:
	    return arr[index];
	case 0.25:
	    return (val_floor * 3 + val_ceil) / 4;
	case 0.5:
	    return (val_floor + val_ceil) / 2;
	case 0.75:
	    return (val_floor + val_ceil * 3) / 4;
	}
    },

};

Display.update = function () {
    Display.Active.prototype.calculate();
    Display.Active.prototype.draw();
};

var display = new Phaser.Game(Display.width, Display.height, Phaser.CANVAS, 'display');

display.state.add('active', Display.Active);
display.state.start('active');
