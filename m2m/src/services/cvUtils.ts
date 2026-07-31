// all of this needs cv instance

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