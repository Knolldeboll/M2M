import { useEffect, useRef, useState } from "react";
import { useOpenCv } from "opencv-react";


import berge from "./assets/berge.jpeg";
import customMat from "./customMat";


interface OpenCVComponentProps {
}


/** Just following the tutorial at https://docs.opencv.org/3.4.20/d0/d84/tutorial_js_usage.html */
const OpenCVComponent = ({ }: OpenCVComponentProps) => {


    const { loaded, cv } = useOpenCv();
    const inputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const outputCanvasRef = useRef<HTMLCanvasElement>(null);
    const [imgSrcURL, setImgSrcURL] = useState<string | null>(null);




    const [changeCanny, setChangeCanny] = useState<false>();

    const [canny1, setCanny1] = useState<number>(50);
    const [canny2, setCanny2] = useState<number>(100);
    const [canny3, setCanny3] = useState<number>(3);



    /**Convert the inputs file to a url and set the imgs src to it. */
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("file changed")
        setImgSrcURL(URL.createObjectURL((event.target as HTMLInputElement).files![0]));
    }

    /**When img element loads its iamge, process it into a mat and show it on the canvas. */

    const onImgLoaded = () => {
        console.log("img loaded")

        if (!canvasRef.current) {
            console.log("no 1st canvas")
            return;
        }
        // Mat: matrix mit Pixeln drin oder so.
        // Wird hier aus dem img-Element rausgezogen, nicht aus der darin angezeigten file!

        // Mat direkt mit imread aus dem img-Element rausziehen und in den canvas rendern.
        const mat = cv.imread(imgRef.current!)
        cv.imshow(canvasRef.current!, mat);

        console.log("show on 1st canvas")
        //Also convert canvas back to a mat

    }




    /** Aus nem canvas 2d context die imagedata rausziehen, dann daraus ein mat generieren. 
     * imagedata braucht man ggf. zum filtern bzw. aufbereiten des bilds, oder auch um drauf zu arbeiten!
     */
    const matFromCanvas = () => {

        console.log("mat from canvas")
        if (!canvasRef.current) {
            console.log("no canvas")
            return;
        }
        // canvas 2d context
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
            console.log("no ctx")
            return;
        }
        // canvas context und getImageData sind vanilla.
        let imgData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        // generiert ein mat aus imgData
        let srcMat = cv.matFromImageData(imgData);


        console.log("mat from canvas result: ", srcMat)

        /*        // Dieses Mat könnte jetzt noch processed werden, z.b. farben convert oä
               // srcmat auf canvas anzeigen.
               cv.imshow(outputCanvasRef.current!, srcMat)
        */

        // Alternativ kann man auch statt imshow das Mat wieder direkt auf den canvas context schreiben: 
        // ggf. braucht man das beim processing von so bilddaten.

        displayImgDataOnCanvas(imgData)


    }


    useEffect(() => {

        console.log("canny changed", canny1, canny2, canny3)

    }, [canny1, canny2, canny3])


    /**Man kann auch imgData wieder in den 2d-context eines canvases schreiben, um anzuzeigen
     * -- ggf. interessant, wenn man imgData manipulieren möchte.
     */
    const displayImgDataOnCanvas = (imgData: any) => {


        if (!outputCanvasRef.current) return;
        //
        const outCanvas = outputCanvasRef.current;
        const outputctx = outCanvas.getContext('2d');
        // erstmal zb definierten bereich löschen bzw. mit transparent schwarzen pixeln ersetzen
        outputctx!.clearRect(0, 0, outCanvas.width, outCanvas.height)

        outCanvas.width = imgData.width;
        outCanvas.height = imgData.height;

        // So hier die imgData spezifisch auf den 2d-context packen!
        outputctx?.putImageData(imgData, 0, 0)
    }





    const rectify = () => {
        if (!imgRef.current || !outputCanvasRef.current) {
            console.log("no img or no output canvas")
            return;
        }
    }


    /** Main Method for processing image from img element */
    const processImg = () => {

        if (!imgRef.current || !outputCanvasRef.current) {
            console.log("no img or no output canvas")
            return;
        }


        const img = imgRef.current;
        const rawMat = cv.imread(img);

        //  use customMat class for applying filters in chained way
        const processedMat = new customMat(cv, rawMat).rgb().bilateralFilter().gray().medianBlur(11).toCvMat();

        console.log("processed mat: ", processedMat)

        display(processedMat);
        return;




        //  cv.Canny(grayMat, cannyMat, canny1, canny2, canny3, false);




    }

    const display = (mat: any) => {


        // Hier immer current enforcen, damit da auch safe kein undefined drin ist.
        // checkt der sonst nicht.
        // obwohl das eig schon oben gemacht wurde..
        cv.imshow(outputCanvasRef.current!, mat);

    }


    //TODO: wenn nicht loaded, dann so spinner oder so.

    // TODO: Checken, ob die lib "opencv-react" wirklich so nice ist - denn wer weiß, was da für ne Version von opencv.js geladen wird?
    return (loaded && (
        <div className=" w-full flex flex-col ">
            <div className="w-[80%] mx-auto" >
                <img ref={imgRef} src={berge} onLoad={processImg} id="imageSrc" alt="No Image" />
                <div >
                    imageSrc <input ref={inputRef} type="file" id="fileInput" name="file" onChange={onFileChange} />
                </div>
            </div>


            <div className="w-[80%] mx-auto" style={{ display: "flex", flexDirection: "column" }}>
                <div >
                    <input type="number" name="canny1" defaultValue="50" onChange={(e) => { setCanny1(parseInt(e.target.value)) }} />
                    <input type="number" name="canny2" defaultValue="100" onChange={(e) => { setCanny2(parseInt(e.target.value)) }} />
                    <input type="number" name="canny3" defaultValue="3" onChange={(e) => { setCanny3(parseInt(e.target.value)) }} />
                </div>  <canvas ref={outputCanvasRef} id="processedOutputCanvas"></canvas>
            </div>

        </div>
    ))



}
export default OpenCVComponent;

