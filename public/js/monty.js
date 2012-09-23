// (function () {

	var canvas, stage, shape, masks = [], img, backgroundImage, imageRatio = 1;

	var imageLoaded = false, update = true;

	var imageData = ["test0.jpg","test1.jpg"];
	var circleCenter = [[835,666],[892,901]];
	var circleData = [];
	circleData.push([{radius:300,axis:'X',power:2}, {radius:150,axis:'Y',power:3}, {radius:100,axis:'X',power:4}]);
	circleData.push([{radius:400,axis:'Y',power:3}, {radius:270,axis:'Y',power:1}, {radius:200,axis:'X',power:2}, {radius:120,axis:'Y',power:3.3}]);

	var currentImage = 1;

	var debug = false;

	
	function init() {
		canvas = document.getElementById("puzzleCanvas");

		// create a new stage and point it at our canvas:
		stage = new createjs.Stage(canvas);

		createjs.Touch.enable(stage);

		resizeCanvas();

		//wait for the image to load
		img = new Image();
		img.onload = handleImageLoad;
		img.src = "/images/" + imageData[currentImage];

		addListeners();

	}

	function addListeners() {
		window.addEventListener('resize', resizeCanvas, false);
		if (Modernizr.touch){
			// bind to touchstart, touchmove, etc and watch `event.streamId`
			stage.onPress = function(mouseEvent) {
				// console.log("pressed");
				mouseEvent.onMouseMove = onMove;
			}
		} else {
			// bind to normal click, mousemove, etc
			stage.mouseEnabled = true;
			canvas.onmousemove  = onMove;
		}
	}

	function onMove(mouseEvent) {
		if (!imageLoaded) return;
		var axis = "";
		if (Modernizr.touch){
			axis = "stage";
		} else {
			axis = "page";
		}
		// console.log(mouseEvent);
	    if(!mouseEvent){ mouseEvent = window.event; }
		var i, l = circleData[currentImage].length;
		for (i=0;i<l;i++) {
			mm = masks[i].bmp;
			mm.rotation = mouseEvent[axis + circleData[currentImage][i].axis] * (circleData[currentImage][i].power);
			// console.log(" => " + mm.x + ":" + mm.y);
		}
		update = true;
	}

	function handleImageLoad() {
		imageLoaded = true;
		// check ratio of image
		imageRatio = img.width / img.height;
		backgroundImage = new createjs.Bitmap(img);
		stage.addChild(backgroundImage);
		
		createjs.Ticker.addListener(window);

		createMasks();
		randomizePuzzle();
		resizeCanvas();
		// console.log(stage);
	}

    function resizeCanvas() {
    	if (imageLoaded) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			scaleImage();
			update = true;
    	}
    }

	function scaleImage () {
		var sc, cw, ch, cr, newx = 0, newy = 0;
		cw = canvas.width;
		ch = canvas.height;
		cr = cw / ch;
		if (cr < imageRatio) {
			// scale based on width
			sc = cw / img.width;
			backgroundImage.x = 0;
			newy = (ch - (img.height*sc))/2;
		} else {
			// scale based on height
			sc = ch / img.height;
			newx = (cw - (img.width*sc))/2;
		}
		backgroundImage.x = newx;
		backgroundImage.y = newy;
		backgroundImage.scaleX = backgroundImage.scaleY = sc;
		// console.log(backgroundImage.image.width + " -> " + cr + "," + newx + ":" + newy);
		// resize masks
		var i, l = circleData[currentImage].length;
		var mm, ma;
		for (i=0;i<l;i++) {
			mm = masks[i].bmp;
			ma = masks[i].mask;
			ma.x = (circleCenter[currentImage][0] * sc) + newx;
			ma.y = (circleCenter[currentImage][1] * sc) + newy;
			mm.x = ma.x;
			mm.y = ma.y;
			mm.scaleX = mm.scaleY = sc;
			ma.scaleX = ma.scaleY = sc;
		}
	}

	function createMasks() {
		var i, l = circleData[currentImage].length;
		for (i=0;i<l;i++) {
			// masks can only be shapes.
			var m = new createjs.Shape();
			// the mask's position will be relative to the parent of its target:
			m.x = circleCenter[currentImage][0];
			m.y = circleCenter[currentImage][1];
			
			var mShape = m.graphics.beginFill();
			if (debug) {
				mShape = mShape.beginStroke("#FF0").setStrokeStyle(5);
			}
			mShape.drawCircle(0,0,circleData[currentImage][i].radius).endStroke();
			var mBmp = new createjs.Bitmap(img);
			mBmp.regX = circleCenter[currentImage][0];
			mBmp.regY = circleCenter[currentImage][1];
			mBmp.x = circleCenter[currentImage][0];
			mBmp.y = circleCenter[currentImage][1];
			mBmp.mask = m;

			masks.push({bmp:mBmp,mask:m});

			stage.addChild(mBmp);
			stage.addChild(m);
			// console.log(mBmp);
		}
	}

	function randomizePuzzle() {
		var i, l = circleData[currentImage].length;
		for (i=0;i<l;i++) {
			mm = masks[i].bmp;
			mm.rotation = Math.random() * 360;
		}
	}

	function tick() {
		// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
		if (update) {
			update = false; // only update once
			stage.update();
		}
	}

	// return this;
// }());
