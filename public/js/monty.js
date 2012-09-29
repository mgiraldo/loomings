// (function () {

	var canvas, stage, masks = [], img, backgroundImage, imageRatio = 1;

	var imageLoaded = false, update = true;

	var imageData = [
					"mayo.jpg",
					"corrientes.jpg",
					"florida.jpg",
					"florida2.jpg"
					];
	var circleCenter = [[943.85,336.45,1000,100],[813.1,515.5,880,900][707.8,803.95,400,900],[670.65,838.65,1500,870]];
	var circleData = [];
	circleData.push([{radius:462,axis:'X',power:-2}]);
	circleData.push([{radius:222,axis:'X',power:-2.5}, {radius:137.2,axis:'Y',power:-3.2}]);
	circleData.push([{radius:421,axis:'Y',power:2}, {radius:180,axis:'X',power:3.2}]);
	circleData.push([{radius:399,axis:'X',power:-2.5}, {radius:350,axis:'Y',power:-3.2}, {radius:285,axis:'X',power:4.4}]);

	var currentImage = 0;

	var debug = false;

	var restartId, winDelay = 1000;

	
	function init() {
		canvas = document.getElementById("puzzleCanvas");

		// create a new stage and point it at our canvas:
		stage = new createjs.Stage(canvas);

		createjs.Touch.enable(stage);

		resizeCanvas();

		loadCurrentImage();

		addListeners();
	}

	function loadCurrentImage() {
		//wait for the image to load
		img = new Image();
		img.onload = handleImageLoad;
		img.src = "/images/" + imageData[currentImage];
	}

	function addListeners() {
		window.addEventListener('resize', resizeCanvas, false);
		addInteractiveListeners();
	}

	function addInteractiveListeners() {
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

	function removeInteractiveListeners() {
		if (Modernizr.touch){
			// bind to touchstart, touchmove, etc and watch `event.streamId`
			stage.onPress = {};
		} else {
			// bind to normal click, mousemove, etc
			canvas.onmousemove  = {};
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
		// scale
		var sc, cw, ch, cr;
		cw = canvas.width;
		ch = canvas.height;
		cr = cw / ch;
		if (cr < imageRatio) {
			// scale based on width
			sc = cw / img.width;
		} else {
			// scale based on height
			sc = ch / img.height;
		}
		// console.log(mouseEvent);
	    if(!mouseEvent){ mouseEvent = window.event; }
		var i, l = circleData[currentImage].length;
		var correct = 0;
		var dx, dy, px, py, dd;
		px = circleCenter[currentImage][2] * sc, py = circleCenter[currentImage][3] * sc;
		dx = mouseEvent[axis + "X"] - px, dy = mouseEvent[axis + "Y"] - py;
		dd = (dx * dx) + (dy * dy);
		// console.log(px, py, dx, dy, dd);
		var str = "";
		for (i=0;i<l;i++) {
			mm = masks[i].bmp;
			mm.rotation = (dx + dy) * circleData[currentImage][i].power; // mouseEvent[axis + circleData[currentImage][i].axis] * (circleData[currentImage][i].power);
			// console.log(" => " + mm.x + ":" + mm.y + " r:" + (mm.rotation%360));
			if (Math.abs(mm.rotation%360) <= 2.5) correct++;
			str += Math.abs(mm.rotation%360) + " ";
		}
		console.log(str);
		if (correct == l) {
			removeInteractiveListeners();
			removeCircles();
			restartId = setInterval(winner, winDelay);
		}
		update = true;
	}

	function removeCircles() {
		var i, l = circleData[currentImage].length;
		for (i=0;i<l;i++) {
			stage.removeChild(masks[i].bmp, masks[i].mask);
		}
	}

	function winner() {
		clearInterval(restartId);
		// all correct! next puzzle
		stage.removeAllChildren();
		imageLoaded = false, masks = [], img = {}, backgroundImage = {};
		currentImage = currentImage == 1 ? 0 : 1;
		loadCurrentImage();
		resizeCanvas();
		addInteractiveListeners();
	}

	function handleImageLoad() {
		console.log(" imw:" + img.width + " imgh:" + img.height);
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
			newy = (ch - (img.height*sc))/2;
		} else {
			// scale based on height
			sc = ch / img.height;
			newx = (cw - (img.width*sc))/2;
		}
		backgroundImage.x = newx;
		backgroundImage.y = newy;
		backgroundImage.scaleX = backgroundImage.scaleY = sc;
		// resize masks
		var i, l = circleData[currentImage].length;
		var mm, ma, mx, my;
		mx = (circleCenter[currentImage][0] * sc) + newx;
		my = (circleCenter[currentImage][1] * sc) + newy;
		// console.log(" newx:" + newx + " newy:" + newy);
		// console.log(" -> centerx:" + circleCenter[currentImage][0] + " centery:" + circleCenter[currentImage][1] + " scale:" + sc);
		// console.log(" -> cw:" + cw + " ch:" + ch + " -> cr:" + cr + " imw:" + img.width + " imgh:" + img.height + " ir:" + imageRatio);
		// console.log(" -> mx:" + mx + " my:" + my);
		for (i=0;i<l;i++) {
			mm = masks[i].bmp;
			ma = masks[i].mask;
			mm.x = ma.x = mx;
			mm.y = ma.y = my;
			mm.scaleX = mm.scaleY = ma.scaleX = ma.scaleY = sc;
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
