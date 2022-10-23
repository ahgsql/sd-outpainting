// first we need to create a stage
var width = window.innerWidth;
var height = window.innerHeight;
var toolbarmode = "select";
var sceneWidth = 1920;
var sceneHeight = 1080;
$(".toolbar").click(function () {
  $(".toolbar").removeClass("btn-primary").addClass("btn-secondary");
  $(this).removeClass("btn-secondary").addClass("btn-primary");

  let mode = $(this).attr("role");
  toolbarmode = mode;
  if (mode == "pan") {
    stage.container().style.cursor = "grabbing";
    stage.draggable(true);
    controller.draggable(false);
  }
  if (mode == "select") {
    stage.draggable(false);
    controller.draggable(true);
  }
  if (mode == "erase") {
    stage.draggable(false);
    controller.draggable(false);
  }
  controller.zIndex(515);
});
var stage = new Konva.Stage({
  container: "container", // id of container <div>
  width: sceneWidth,
  height: sceneHeight,
  background: "#ffda44",
  stroke: "black",
  strokeWidth: 1,
  draggable: false,
});
$("#btnZoomOut").click(() => {
  stageZoom(0.8);
  $("#scaleHelpText").text(Math.round(stage.scale().x * 100) + "%");
});
$("#btnZoomIn").click(() => {
  stageZoom(1.2);
  $("#scaleHelpText").text(Math.round(stage.scale().x * 100) + "%");
});
$("#scaleHelpText").click(() => {
  let current = stage.scaleX();
  let target = 1 / current;
  stageZoom(target);
  $("#scaleHelpText").text(Math.round(stage.scale().x * 100) + "%");
});
$("#scaleHelpText").text(stage.scale().x * 100 + "%");
var scaleBy = 2;

function fitStageIntoParentContainer() {
  var container = document.querySelector("#stage-parent");

  // now we need to fit stage into parent container
  var containerWidth = container.offsetWidth;

  // but we also make the full scene visible
  // so we need to scale all objects on canvas
  var scale = containerWidth / sceneWidth;

  stage.width(sceneWidth * scale);
  stage.height(sceneHeight * scale);
  stage.scale({ x: scale, y: scale });
}

fitStageIntoParentContainer();
// adapt the stage on any window resize
window.addEventListener("resize", fitStageIntoParentContainer);
stage.on("wheel", (e) => {
  let oldpos = stage.position();
  stage.position({ x: oldpos.x, y: oldpos.y - e.evt.deltaY / 5 });
  return;
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
  x: width / 2 - 256,
  y: height / 2 - 256,
  width: 512,
  height: 512,
  fill: "#00ffff00",
  stroke: "#2e09ff",
  strokeWidth: 1,
  // dash: [13, 20],
  draggable: true,
});
controller.fillPriority("pattern");

// add the shape to the layer
layer.add(controller);
controller.position({
  x: Math.round(controller.x() / 22.2222222) * 22.2222222,
  y: Math.round(controller.y() / 22.2222222) * 22.2222222,
});

// darth vader
var backDrop = new Image();
let bdImage = new Konva.Image({
  width: 512,
  height: 512,
  x: width / 2 - 256,
  y: height / 2 - 256,
  image: backDrop,
});

backDrop.src = "./assets/backdrop.png";
backDrop.onload = () => {
  layer.add(bdImage);
  bdImage.zIndex(0);
  bdImage.position(controller.position());
};

let helptext1 = new Konva.Text({
  text: "Diffusion Frame",
  fontSize: 18,
  fontFamily: "ColfaxAI",
  fill: "#2e09ff",
  width: 512,

  align: "left",
});
layer.add(helptext1);
helptext1.position({
  x: controller.position().x,
  y: controller.position().y - 18,
});
controller.on("dragmove", (e) => {
  controller.position({
    x: Math.round(controller.x() / 22.2222222) * 22.2222222,
    y: Math.round(controller.y() / 22.2222222) * 22.2222222,
  });
  bdImage.position(controller.position());
  helptext1.position({
    x: controller.position().x,
    y: controller.position().y - 20,
  });
  stage.batchDraw();
});
controller.on("mouseenter", function () {
  stage.container().style.cursor = "pointer";
});

controller.on("mouseleave", function () {
  stage.container().style.cursor = "default";
});
controller.on("mousedown", function () {
  stage.container().style.cursor = "grabbing";
});
controller.on("mouseup", function () {
  stage.container().style.cursor = "pointer";
});
// add the layer to the stage
stage.add(layer);
// draw the image
layer.draw();
Konva.hitOnDragEnabled = true;

const bgLayer = new Konva.Layer();
stage.add(bgLayer);
const WIDTH = 400;
const HEIGHT = 400;

function checkShapes() {
  const startX = Math.floor((-stage.x() - stage.width()) / WIDTH) * WIDTH;
  const endX = Math.floor((-stage.x() + stage.width() * 2) / WIDTH) * WIDTH;

  const startY = Math.floor((-stage.y() - stage.height()) / HEIGHT) * HEIGHT;
  const endY = Math.floor((-stage.y() + stage.height() * 2) / HEIGHT) * HEIGHT;
  var imageObj = new Image();

  for (var x = startX; x < endX; x += WIDTH) {
    for (var y = startY; y < endY; y += HEIGHT) {
      var yoda = new Konva.Image({
        x,
        y,
        image: imageObj,
        zIndex: 0,
      });
      // add the shape to the layer
      bgLayer.add(yoda);
      imageObj.src = "./assets/dots.webp";
    }
  }
}

checkShapes();
bgLayer.draw();
bgLayer.zIndex(0);

stage.on("dragend", () => {
  bgLayer.destroyChildren();
  checkShapes();
  bgLayer.draw();
});

function stageZoom(scaleBy) {
  var oldScale = stage.scaleX();

  var center = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };

  var relatedTo = {
    x: (center.x - stage.x()) / oldScale,
    y: (center.y - stage.y()) / oldScale,
  };

  var newScale = oldScale * scaleBy;

  stage.scale({
    x: newScale,
    y: newScale,
  });

  var newPos = {
    x: center.x - relatedTo.x * newScale,
    y: center.y - relatedTo.y * newScale,
  };

  stage.position(newPos);
  stage.batchDraw();
}
var isPaint = false;

var lastLine;

stage.on("mousedown touchstart", function (e) {
  isPaint = true;
  var pos = stage.getPointerPosition();
  if (toolbarmode == "erase") {
    lastLine = new Konva.Line({
      stroke: "#df4b26",
      strokeWidth: 55,
      globalCompositeOperation:
        toolbarmode === "erase" ? "destination-out" : "source-over",
      // round cap for smoother lines
      lineCap: "round",
      lineJoin: "round",
      // add point twice, so we have some drawings even on a simple click
      points: [pos.x, pos.y, pos.x, pos.y],
    });
    layer.add(lastLine);
  }
});

stage.on("mouseup touchend", function () {
  isPaint = false;
});

// and core function - drawing
stage.on("mousemove touchmove", function (e) {
  if (!isPaint) {
    return;
  }

  // prevent scrolling on touch devices
  e.evt.preventDefault();
  if (toolbarmode == "erase") {
    const pos = stage.getPointerPosition();
    var newPoints = lastLine.points().concat([pos.x, pos.y]);
    lastLine.points(newPoints);
  }
});
