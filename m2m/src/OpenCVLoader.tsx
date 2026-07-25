import cvModule from "@techstark/opencv-js";

let cvInstance: Promise<any> | null = null;

export function getCv(): Promise<any> {
  if (!cvInstance) {
    cvInstance = getOpenCv();
  }
  return cvInstance;
}

async function getOpenCv() {
  let cv;
  if (cvModule instanceof Promise) {
    cv = await cvModule;
  } else if (cvModule.Mat) {
    cv = cvModule;
  } else {
    await new Promise<void>((resolve) => {
      cvModule.onRuntimeInitialized = () => resolve();
    });
    cv = cvModule;
  }
  return cv;
}
