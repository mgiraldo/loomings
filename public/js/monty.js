// (function () {

	var canvas, stage, masks = [], img, backgroundImage, imageRatio = 1;

	var imageLoaded = false, update = true, hasWon = false;

	var rotTolerance = 2.5;

	var circleData = [];
	circleData.push({photo:"mayo.jpg",center:[813.1,515.5],point:[880,900],circles:[{radius:231,axis:'X',power:-2}]});
	circleData.push({photo:"corrientes.jpg",center:[943.85,336.45],point:[1000,100],circles:[{radius:222,axis:'X',power:-3}, {radius:137.2,axis:'Y',power:3.3}]});
	circleData.push({photo:"florida.jpg",center:[707.8,803.95],point:[400,900],circles:[{radius:210,axis:'Y',power:3}, {radius:90,axis:'X',power:-5.1}]});
	circleData.push({photo:"florida2.jpg",center:[670.65,838.65],point:[1500,870],circles:[{radius:175,axis:'X',power:-2}, {radius:142.5,axis:'Y',power:-4}]});
	circleData.push({photo:"belgrano1.jpg",center:[873,803],point:[900,600],circles:[{radius:236.5,axis:'X',power:-2}, {radius:90,axis:'Y',power:3.4}]});
	circleData.push({photo:"belgrano2.jpg",center:[757,718],point:[300,700],circles:[{radius:319,axis:'Y',power:3}, {radius:61.5,axis:'X',power:-2.8}]});
	circleData.push({photo:"chino1.jpg",center:[864,574],point:[1400,170],circles:[{radius:458,axis:'X',power:-2}, {radius:212,axis:'Y',power:-5.3}]});
	circleData.push({photo:"chino3.jpg",center:[392,660],point:[1000,440],circles:[{radius:192.5,axis:'Y',power:-4}, {radius:127,axis:'X',power:5.2}]});
	circleData.push({photo:"prueba33.jpg",center:[888.3,622.7],point:[100,640],circles:[{radius:408.5,axis:'Y',power:-1}, {radius:295,axis:'X',power:3}, {radius:168.5,axis:'X',power:-4}]});

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
		img.src = "/images/" + circleData[currentImage].photo;
	}

	function addListeners() {
		window.addEventListener('resize', resizeCanvas, false);
		addInteractiveListeners();
	}

	function addInteractiveListeners() {
		if (Modernizr.touch){
			// bind to touchstart
			stage.onPress = function(mouseEvent) {
				// console.log("pressed");
				mouseEvent.onMouseMove = onMove;
			}
		} else {
			// bind to mousemove
			stage.mouseEnabled = true;
			canvas.onmousemove  = onMove;
		}
	}

	function removeInteractiveListeners() {
		if (Modernizr.touch){
			// remove touch
			stage.onPress = {};
		} else {
			// remove mousemove
			canvas.onmousemove  = {};
		}
	}

	function onMove(mouseEvent) {
		if (!imageLoaded || hasWon) return;
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
		var i, l = circleData[currentImage].circles.length;
		var correct = 0;
		var d, dx, dy, px, py, dd;
		px = circleData[currentImage].point[0] * sc, py = circleData[currentImage].point[1] * sc;
		dx = mouseEvent[axis + "X"] - px, dy = mouseEvent[axis + "Y"] - py;
		dd = (dx * dx) + (dy * dy);
		// console.log(px, py, dx, dy, dd);
		var str = "";
		for (i=0;i<l;i++) {
			mm = masks[i].bmp;
			d = mouseEvent[axis + "" + circleData[currentImage].circles[i].axis];
			if (circleData[currentImage].circles[i].axis == "X") {
				d -= px;
			} else {
				d -= py;
			}
			mm.rotation = d * circleData[currentImage].circles[i].power; // mouseEvent[axis + circleData[currentImage].circles[i].axis] * (circleData[currentImage].circles[i].power);
			// console.log(" => " + mm.x + ":" + mm.y + " r:" + (mm.rotation%360));
			var moduloRot = Math.abs(mm.rotation%360);
			if (moduloRot <= rotTolerance || moduloRot >= 360 - rotTolerance) correct++;
			str += Math.abs(mm.rotation%360) + " ";
		}
		// console.log(str);
		if (correct == l) {
			hasWon = true;
			removeInteractiveListeners();
			removeCircles();
			restartId = setInterval(winner, winDelay);
		}
		update = true;
	}

	function removeCircles() {
		var i, l = circleData[currentImage].circles.length;
		for (i=0;i<l;i++) {
			stage.removeChild(masks[i].bmp, masks[i].mask);
		}
	}

	function winner() {
		clearInterval(restartId);
		// all correct! next puzzle
		stage.removeAllChildren();
		imageLoaded = false, masks = [], img = {}, backgroundImage = {};
		currentImage++;
		if (currentImage >= circleData.length) {
			currentImage = 0;
		}
		loadCurrentImage();
		resizeCanvas();
		addInteractiveListeners();
	}

	function handleImageLoad() {
		// console.log(" imw:" + img.width + " imgh:" + img.height);
		imageLoaded = true;
		hasWon = false;
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
		var i, l = circleData[currentImage].circles.length;
		var mm, ma, mx, my;
		mx = (circleData[currentImage].center[0] * sc) + newx;
		my = (circleData[currentImage].center[1] * sc) + newy;
		// console.log(" newx:" + newx + " newy:" + newy);
		// console.log(" -> centerx:" + circleData[currentImage].center[0] + " centery:" + circleData[currentImage].center[1] + " scale:" + sc);
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
		var i, l = circleData[currentImage].circles.length;
		for (i=0;i<l;i++) {
			// masks can only be shapes.
			var m = new createjs.Shape();
			// the mask's position will be relative to the parent of its target:
			m.x = circleData[currentImage].center[0];
			m.y = circleData[currentImage].center[1];
			
			var mShape = m.graphics.beginFill();
			if (debug) {
				mShape = mShape.beginStroke("#FF0").setStrokeStyle(5);
			}
			mShape.drawCircle(0,0,circleData[currentImage].circles[i].radius).endStroke();
			var mBmp = new createjs.Bitmap(img);
			mBmp.regX = circleData[currentImage].center[0];
			mBmp.regY = circleData[currentImage].center[1];
			mBmp.x = circleData[currentImage].center[0];
			mBmp.y = circleData[currentImage].center[1];
			mBmp.mask = m;

			masks.push({bmp:mBmp,mask:m});

			stage.addChild(mBmp);
			stage.addChild(m);
			// console.log(mBmp);
		}
	}

	function randomizePuzzle() {
		var i, l = circleData[currentImage].circles.length;
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
