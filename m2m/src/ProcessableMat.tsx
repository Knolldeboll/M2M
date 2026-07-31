
/**Class containing overweritable cv.mat that allows chaining itself with filter methods. */
class ProcessableMat {


    private mat: any;
    private cv: any;
    private colorSpace: string;

    /**Provide cv instance */
    constructor(cv: any, initialMat: any, colorSpace: string = "RGBA") {


        this.cv = cv;
        this.mat = initialMat;
        this.colorSpace = colorSpace;
        console.log(this.colorSpace)
    }


    /** All filter methods modify this.material and return this to allow chaining */


    public gaussianBlur = () => {

        const outMat = new this.cv.Mat();
        const ksize = new this.cv.Size(5, 5);

        this.cv.GaussianBlur(this.mat, outMat, ksize, 0, 0, this.cv.BORDER_DEFAULT);


        this.mat.delete();
        this.mat = outMat;
        return this;
    }


    /**
     * Applies bilateral Filter. Mat must be converted  to RGB (better) or gray before.
     *  */
    public bilateralFilter = () => {



        //console.log("bilateralFilter: pre RGB, outMat: ", this.mat)


        // ggf. ist schon in rgb, vielleicht stört dann nächster schritt

        // console.log("bilateralFilter: converted to RGB, outMat: ", outMat)

        // das nix. aber warum?

        this.replace((inMat, outMat) => {
            this.cv.bilateralFilter(inMat, outMat, 9, 150, 100, this.cv.BORDER_DEFAULT);
        })

        return this;

    }

    /**
     * applies median blur. should be grayed before
     *  
     * */
    public medianBlur = (strength = 3) => {

        this.replace((inMat, outMat) => {
            this.cv.medianBlur(inMat, outMat, strength);
        })
        return this;
    }


    //////////// COLOR CONVERSIONS ////////////

    // TODO: Hier schauen, ob man diese Enum mit den Farbkonversionen iwie auch dynamisch erzeugen kann!
    // sodass der erste term abänderbar ist 
    public gray = () => {

        // console.log("enum? type:", typeof (this.cv.COLOR_RGBA2GRAY))
        // Andererseits: in diesem Fall scheints egal, ob hier rgba oder rgb drin ist ,denn ich denk da werden einfach alle kanäle auf 1 gemappt

        // replace handlet dieses speichern und garbagecollecten der mats
        this.replace((inMat, outMat) => { this.cv.cvtColor(inMat, outMat, this.cv.COLOR_RGB2GRAY, 0) });

        return this;
    };

    /**Convert RGBA 2 RGB */
    public rgb = () => {

        this.replace((inMat, outMat) => { this.cv.cvtColor(inMat, outMat, this.cv.COLOR_RGBA2RGB, 0) });
        return this;

    }

    public gray2rgba = () => {
        this.replace((inMat, outMat) => { this.cv.cvtColor(inMat, outMat, this.cv.COLOR_GRAY2RGBA, 0) });
        return this;

    }


    // TODO: Man kann auch nur eine Process-Function machen, ddie immer outmat und delete und thismat neu zuweist, und zwischendrin was anders macht
    // das andere kommt per parameter rien.

    public canny = () => {


        // Param 1/2 hoch: unsensitiver für kanten. nur kranke kanten kommen raus.
        //  ggf. nicht schlecht bei bg-Wolken zum rausfiltern.

        this.replace((inMat, outMat) => { this.cv.Canny(inMat, outMat, 50, 100, 3, false); })

        return this;
    }


    // create new Mat, process, replace old mat with new mat, delete old mat

    // in process ist die funktion, die angewendet wird. 
    // diese braucht auch inMat und outMat zum lesen/schreiben.
    private replace = (process: (inMat: any, outMat: any) => any) => {

        const outMat = new this.cv.Mat();

        // hier werden tatsächliche mats in die process-funktion übergeben, die dann in der funktion bearbeitet werden können.
        // also das current this.mat, schreiben auf outmat, welches dann später übernommen werden kann.
        process(this.mat, outMat);
        this.mat.delete();
        this.mat = outMat;

    }
    public toCvMat = () => {
        return this.mat;
    };


} export default ProcessableMat;