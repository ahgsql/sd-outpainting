// first we need to create a stage
var width = window.innerWidth;
var height = window.innerHeight;
var stage = new Konva.Stage({
  container: "container", // id of container <div>
  width: width,
  height: height,
  background: "#ffda44",
  stroke: "black",
  strokeWidth: 1,
  draggable: true,
});
var scaleBy = 1.11;

stage.on("wheel", (e) => {
  // stop default scrolling
  e.evt.preventDefault();

  var oldScale = stage.scaleX();
  var pointer = stage.getPointerPosition();

  var mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  // how to scale? Zoom in? Or zoom out?
  let direction = e.evt.deltaY > 0 ? -1 : 1;

  // when we zoom on trackpad, e.evt.ctrlKey is true
  // in that case lets revert direction
  if (e.evt.ctrlKey) {
    direction = -direction;
  }

  var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });

  var newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
});

// then create layer
var layer = new Konva.Layer();
// create our shape
var controller = new Konva.Rect({
  x: 20,
  y: 20,
  width: 512,
  height: 512,
  fill: "#00ffff10",
  stroke: "blue",
  strokeWidth: 0.4,
  dash: [3, 3],
  draggable: true,
});
// add the shape to the layer
layer.add(controller);

// darth vader

// add the layer to the stage
stage.add(layer);
// draw the image
layer.draw();
Konva.hitOnDragEnabled = true;
