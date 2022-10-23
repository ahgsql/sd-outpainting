var loadingAnim;
var angularSpeed = 8;
var latestPrompt = "";
loadingAnim = new Konva.Animation(function (frame) {
  let currentSWidth = controller.strokeWidth();
  var angleDiff = angularSpeed * (frame.timeDiff / 1000);

  if (currentSWidth >= 7) {
    angularSpeed = -8;
  } else if (currentSWidth <= 2) {
    angularSpeed = 8;
  }
  controller.strokeWidth(currentSWidth + angleDiff);
}, layer);

function predict(options) {
  changeDraggable(false);
  $("#save").slideDown("slow");
  let prompt = options.prompt || "fatih sultan mehmet",
    sampler = options.sampler || "Euler a",
    steps = options.steps || 10,
    seed = options.seed || -1,
    w = options.w || 512,
    h = options.h || 512,
    tiling = options.tiling || false;
  latestPrompt = prompt;
  $.ajax({
    url: "http://127.0.0.1:3000/txt2img",
    type: "POST",
    data: JSON.stringify({
      prompt,
      steps,
      sampler_name: sampler,
      seed,
      width: w,
      height: h,
      tiling,
    }),
    contentType: "application/json",
    complete: (res) => {
      let placeX = controller.attrs.x,
        placeY = controller.attrs.y;

      let result = res.responseJSON;
      let firstimage = result.image;
      var imageObj1 = new Image();
      imageObj1.src = "data:image/png;base64," + firstimage;
      // darth vader
      let newImage = new Konva.Image({
        width: 512,
        height: 512,
        x: placeX,
        y: placeY,
        image: imageObj1,
      });

      newImage.off("click");

      layer.add(newImage);
      let zIndex = controller.zIndex();
      controller.zIndex(zIndex + 2);
      changeDraggable(true);
    },
  });
}
var outPaintImgs = [];
var currIdx = 0;
function outpaint(options) {
  changeDraggable(false);
  let prompt = options.prompt || "fatih sultan mehmet",
    image = options.image;
  latestPrompt = prompt;
  $.ajax({
    url: "http://127.0.0.1:3000/outpaint",
    type: "POST",
    data: JSON.stringify({
      prompt,
      image,
    }),
    contentType: "application/json",
    complete: (res) => {
      let result = res.responseJSON;
      result.images.shift();
      outPaintImgs = [];
      currIdx = 0;
      result.images.forEach((image) => {
        let imObj = new Image();
        imObj.src = "data:image/png;base64," + image;
        outPaintImgs.push(imObj);
      });

      controller.fillPatternImage(outPaintImgs[currIdx]);
      loadingAnim.stop();
      $("#selector").slideDown("slow");
      $("#currentIndex").text(currIdx + 1);
      //layer.add(newImage);
    },
  });
}
function changeDraggable(can) {
  if (!can) {
    loadingAnim.start();
  } else {
    controller.strokeWidth(1);
    loadingAnim.stop();
  }
  controller.draggable(can);
}

function loadingSequence() {
  for (let st = 0; st < 20; st += 0.05) {
    console.log(st);
    setTimeout(() => {
      controller.strokeWidth(21 - st);
    }, st * 230);
  }
}

$("#previousImg").click(() => {
  if (currIdx > 0) {
    currIdx--;
  }
  $("#currentIndex").text(currIdx + 1);
  controller.fillPatternImage(outPaintImgs[currIdx]);
});
$("#nextImg").click(() => {
  if (currIdx < outPaintImgs.length - 1) {
    currIdx++;
  }
  $("#currentIndex").text(currIdx + 1);
  controller.fillPatternImage(outPaintImgs[currIdx]);
});
$("#btnAccept").click(() => {
  let placeX = controller.attrs.x,
    placeY = controller.attrs.y;

  let newImage = new Konva.Image({
    width: 512,
    height: 512,
    x: placeX,
    y: placeY,
    image: outPaintImgs[currIdx],
  });

  controller.fillPatternImage(null);
  changeDraggable(true);
  layer.add(newImage);
  let zIndex = controller.zIndex();
  controller.zIndex(zIndex + 1);
  $("#selector").slideUp("slow");
});
$("#btnCancel").click(() => {
  controller.fillPatternImage(null);
  changeDraggable(true);
  $("#selector").slideUp("slow");
});

$("#save").click(function () {
  let oldScale = stage.scale();
  stage.scale({ x: 1, y: 1 });

  controller.visible(false);
  bgLayer.visible(false);
  bdImage.visible(false);
  var image = stage.toImage({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    pixelRatio: 1,
    callback(img) {
      let base64 = img.src.split(",")[1];
      var download = document.createElement("a");
      download.href = img.src;
      download.download = latestPrompt + ".png";
      download.click();
    },
  });
  controller.visible(true);
  bgLayer.visible(true);
  bdImage.visible(true);
  stage.scale(oldScale);
});
