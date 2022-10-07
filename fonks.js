function predict(
  prompt,
  sampler = "Euler a",
  steps = 3,
  seed = -1,
  w = 512,
  h = 512,
  tiling = false
) {
  $.ajax({
    url: "http://127.0.0.1:7860/v1/txt2img",
    type: "POST",
    data: JSON.stringify({
      txt2imgreq: {
        prompt,
        steps,
        sampler_name: sampler,
        seed,
        width: w,
        height: h,
        tiling,
      },
    }),
    contentType: "application/json",
    complete: (res) => {
      let placeX = controller.attrs.x,
        placeY = controller.attrs.y;

      let result = res.responseJSON;
      let firstimage = result.images[0];
      var imageObj1 = new Image();
      imageObj1.src = "data:image/png;base64," + firstimage;
      // darth vader
      let darthVaderImg = new Konva.Image({
        width: 512,
        height: 512,
        x: placeX,
        y: placeY,
        image: imageObj1,
      });
      darthVaderImg.off("click");

      layer.add(darthVaderImg);
      let zIndex = controller.zIndex();
      controller.zIndex(zIndex + 1);
    },
  });
}
