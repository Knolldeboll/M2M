import ProcessableMat from "../ProcessableMat";
import { getCv } from "./cvLoader";
//import { extractPois, extractRidgePoints, smoothRidgePoints } from "./extraction";

/** Loads cv instance, then provides process and POI extraction  */
class CvProcessor {

    private cvInstance;

    private constructor(cv: any) {
        this.cvInstance = cv;
        console.log("this cvprocessor", this)
    }

    static async create() {
        let cv = await getCv();
        console.log("CV Gotten:", cv)
        return new CvProcessor(cv);
    }

    /** Start the pipeline containing opencv.Mat based filtering, processing, and edge extraction. */
    public processImgIntoEdgeMat(inputImg: HTMLImageElement) {


        console.log("processImgIntoEdgeMat")
        const rawMat = this.cvInstance.imread(inputImg);

        //const displayRawMat = rawMat.clone();
        //const rectMat = rectify(rawMat);

        //  use customMat class for applying filters in chained way
        const processedMat = new ProcessableMat(this.cvInstance, rawMat)
            .rgb()
            .bilateralFilter()
            .gray()
            .medianBlur(5)
            .canny()
            .toCvMat();
        // point[]-returning extraction operations

        return processedMat;
    }

}
export default CvProcessor;