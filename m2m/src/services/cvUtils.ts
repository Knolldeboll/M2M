// all of this needs cv instance

import ProcessableMat from "../ProcessableMat";
import { getCv } from "./cvLoader";

/**
 * @param context canvascontext2D
 * @returns mat
 */
export const matFromCanvas = (cvInstance: any, canvas: HTMLCanvasElement) => {
  console.log("mat from canvas");

  const context = canvas.getContext("2d");

  if (!context) {
    console.log("no canvas 2d context");
    return;
  }

  // canvas context und getImageData sind vanilla.
  let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
  // generiert ein mat aus imgData
  let srcMat = cvInstance.matFromImageData(imgData);

  console.log("mat from canvas result: ", srcMat);

  return srcMat;
};

export const drawPointsOnMat = async (
  points: { x: number; y: number }[],
  inMat: any,
  radius: number = 3,
  baseColor: "gray" | "rgba",
  canvas: HTMLCanvasElement,
) => {
  console.log("draw points on mat");
  const overlay = inMat.clone();
  const cv = await getCv();
  let overlayColored;

  switch (baseColor) {
    case "gray":
      overlayColored = new ProcessableMat(cv, overlay).gray2rgba().toCvMat();
      break;
    case "rgba":
      overlayColored = new ProcessableMat(cv, overlay).toCvMat();
      break;
  }

  console.log(overlayColored.channels());
  // return;
  for (const p of points) {
    cv.circle(
      overlayColored,
      new cv.Point(p.x, p.y),
      radius,
      new cv.Scalar(255, 255, 255, 255),
      -1,
    );
  }

  cv.imshow(canvas, overlayColored);
  //overlay.delete();
  //inMat.delete();
};
