var Display = {
    width:  620,
    height: 340,
    draw_width: 600,
    draw_offset: 10,
    
    line_width: 2,
    box_height: 50,
    intervals: 4,
};

var stats = {
    min:    undefined,
    q1:     undefined,
    median: undefined,
    q3:     undefined,
    max:    undefined,

    min_valid: undefined, // non-outlier
    max_valid: undefined, // non-outlier
    
    average: undefined,

    range: undefined,
    IQR:   undefined,

    outliers: [],
};

Display.Active = function (display) { };

Display.Active.prototype = {
    create: function () {
	Display.scale_text = {};
	Display.scale_text.left = display.add.text(0, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.right = display.add.text(Display.draw_width + Display.draw_offset, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	Display.scale_text.right.anchor.x = 0.7;

	for (var i = 1; i < Display.intervals; i++) {
	    Display.scale_text["i" + i] = display.add.text(i * Display.width / Display.intervals, Display.height - 20, '0', { font: '20px Arial', fill: '#444' });
	    Display.scale_text["i" + i].anchor.x = 0.5;
	}

	this.update_boxplot();
    },

    update_boxplot: function () {
	var arr = this.get_values();

	if (arr.length > 0) {
	    this.calculate(arr);
	    this.draw();
	}

	$("#q0").html(stats.min);
	$("#q1").html(stats.q1);
	$("#q2").html(stats.median);
	$("#q3").html(stats.q3);
	$("#q4").html(stats.max);
    },

    get_values: function () {
	var arr = [];
	for (var s in localStorage) {
	    if (s.substring(0, 3) === "ss_" && localStorage[s] !== "" && !isNaN(localStorage[s])) {
		arr.push(+localStorage[s]); // the '+' casts the strings into numbers. Remove at your own peril.
	    }
	}

	arr = arr.sort(function(a, b){return a-b}); // sort numerically

	return arr;
    },
    
    calculate: function (arr) {
	// calculate five number summary
	stats.min    = this.quartile(arr, 0);
	stats.q1     = this.quartile(arr, 1);
	stats.median = this.quartile(arr, 2);
	stats.q3     = this.quartile(arr, 3);
	stats.max    = this.quartile(arr, 4);

	// calculate arithmetic mean
	stats.average = 0;
	for (var i = 0; i < arr.length; i++) {
	    stats.average += arr[i];
	}
	stats.average /= arr.length;

	// calculate spread statistics
	stats.range = stats.max - stats.min;
	stats.IQR   = stats.q3  - stats.q1;

	stats.outliers = [];
	// calculate lower outliers
	i = 0;
	stats.min_valid = stats.min;
	while (arr[i] < stats.q1 - 1.5 * stats.IQR) {
	    stats.min_valid = arr[i + 1];
	    stats.outliers.push(arr[i]);
	    
	    i++;
	}

	// calculate upper outliers
	i = arr.length - 1;
	stats.max_valid = stats.max;
	while (arr[i] > stats.q3 + 1.5 * stats.IQR) {
	    stats.max_valid = arr[i - 1];
	    stats.outliers.push(arr[i]);
	    
	    i--;
	}
    },
    
    draw: function () {
	if (display.graphics) {
	    display.graphics.destroy();
	}
	
	display.graphics = display.add.graphics(0, 0);
	display.graphics.lineStyle(2, 0x000000, 1);

	var stats_pixels = {};
	for (e in stats) {
	    if (e === "outliers") {
		stats_pixels[e] = [];
		for (var i = 0; i < stats[e].length; i++) {
		    stats_pixels[e].push(this.to_pixels(stats[e][i]));
		}
	    }
	    else {
		stats_pixels[e] = this.to_pixels(stats[e]);
	    }
	}

	// horizontal lines
	this.draw_line(stats_pixels.min_valid, Display.height / 2, stats_pixels.q1, Display.height / 2);
	this.draw_line(stats_pixels.q3, Display.height / 2, stats_pixels.max_valid, Display.height / 2);

	// vertical lines
	this.draw_line(stats_pixels.min_valid, Display.height / 2 + Display.box_height, stats_pixels.min_valid, Display.height / 2 - Display.box_height);
	this.draw_line(stats_pixels.max_valid, Display.height / 2 + Display.box_height, stats_pixels.max_valid, Display.height / 2 - Display.box_height);
	
	display.graphics.drawRect(stats_pixels.q1, Display.height / 2 - Display.box_height, stats_pixels.median - stats_pixels.q1, Display.box_height * 2);
	display.graphics.drawRect(stats_pixels.q1, Display.height / 2 - Display.box_height, stats_pixels.q3 - stats_pixels.q1, Display.box_height * 2);

	for (var i = 0; i < stats_pixels.outliers.length; i++) {
	    this.draw_outlier(stats_pixels.outliers[i], Display.height / 2);
	}

	// scale
	display.graphics.lineStyle(1, 0x444444, 1);
	this.draw_line(0, Display.height - 24, Display.width, Display.height - 24);

	Display.scale_text.left.text = stats.min;
	Display.scale_text.right.text = stats.max;

	for (var i = 1; i < Display.intervals; i++) {
	    Display.scale_text["i" + i].text = Math.round((stats.min + i * stats.range / Display.intervals) * 100) / 100;
	}
    },

    draw_line: function (x1, y1, x2, y2) {
	display.graphics.moveTo(x1, y1);
	display.graphics.lineTo(x2, y2);
    },

    draw_outlier: function (x, y) {
	var width = 6;
	display.graphics.drawRect(x - width / 2, y - width / 2, width, width);
    },
    
    to_pixels: function (x) {
	return ((x - stats.min) / stats.range) * (Display.draw_width) + Display.draw_offset;
    },

    quartile_old: function (arr, q) { // q should be 0, 1, 2, 3, or 4
	var index = q * 0.25 * (arr.length - 1);

	var val_floor = arr[Math.floor(index)];
	var val_ceil  = arr[Math.ceil(index)];

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

    quartile: function (arr, q) {
	var split_array = this.median(arr);

	switch (q) {
	case 0:
	    return arr[0];
	case 1:
	    return this.median(split_array.left).median;
	case 2:
	    return split_array.median;
	case 3:
	    return this.median(split_array.right).median;
	case 4:
	    return arr[arr.length - 1];
	}
    },

    median: function (arr) {
	var ret = {
	    median: undefined,
	    left:   undefined,
	    right:  undefined,
	}
	var index;
	
	if (arr.length % 2 === 1) {
	    index = Math.floor(arr.length / 2);
	    ret.median = arr[index];
	    ret.left   = arr.slice(0, index);
	    ret.right  = arr.slice(index + 1);
	}
	else {
	    index = arr.length / 2;
	    ret.median = (arr[index - 1] + arr[index]) / 2;
	    ret.left   = arr.slice(0, index);
	    ret.right  = arr.slice(index);
	}

	return ret;
    },
};

Display.update = function () {
    Display.Active.prototype.update_boxplot();
};

var display = new Phaser.Game(Display.width, Display.height, Phaser.CANVAS, 'display', null, true);

display.state.add('active', Display.Active);
display.state.start('active');
