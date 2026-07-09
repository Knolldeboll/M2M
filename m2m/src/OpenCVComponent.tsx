import { useEffect, useRef, useState } from "react";
import { useOpenCv } from "opencv-react";
import * as Tone from "tone";
import "./types.ts"


import berge from "./assets/berge.jpeg";
import customMat from "./customMat";
import SoundConverter from "./SoundConverter";
import type { Point } from "./types.ts";


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

    const finalPois = useRef<Point[] | null>(null);


    const soundConverter = useRef<SoundConverter | null>(null);

    const [soundReady, setSoundReady] = useState(false);

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




    // TODO: put area of interest rectangle on the mat
    // also display this to the user beforehand - maybe in a overlaid same-sized rect  on the canvas that displays the camera input,
    // rather than modifying and redisplaying the canvasses' mat.
    const rectify = (inMat: any) => {
        if (!imgRef.current || !outputCanvasRef.current) {
            console.log("no img or no output canvas")
            return;
        }

        // Dreck: das ist in pixeln und nicht responsive in %.
        // muss man ggf. anhand der bildschirmgröße neu berechnen.
        // z.B. bilschirm ist 600px lang und 400px breit: dann soll margin davon je 10% sein.
        // d.h. 60, 40, 540 560


        // das ist X Y W H Kollege.

        let rect = new cv.Rect(255, 120, 400, 100);


        return inMat.roi(rect);

    }


    /** Main Method for processing image from img element */
    const processImg = () => {

        if (!imgRef.current || !outputCanvasRef.current) {
            console.log("no img or no output canvas")
            return;
        }


        const img = imgRef.current;
        const rawMat = cv.imread(img);

        const rectMat = rectify(rawMat);
        rawMat.delete();

        //  use customMat class for applying filters in chained way
        const processedMat = new customMat(cv, rectMat).rgb().bilateralFilter().gray().medianBlur(5).canny().toCvMat();

        console.log("processed mat: ", processedMat)

        //displayMat(processedMat);

        const extracted = extractRidgePoints(processedMat)
        const smoothened = smoothRidgePoints(extracted);

        const pois = extractPois(smoothened);

        finalPois.current = pois;


        // packt die pois aufs canny-mat und displayt das dann auf dem canvas!

        drawPointsOnMat(extracted, processedMat)
        drawPointsOnMat(pois, processedMat);



        // TODO: search pois in (smothened) ridge 
        // TODO: Display pois on image. attention: 
        //       must draw them in the overlaid ROI, not on the raw image of cam-input-size!
        return;
    }

    /**Extract points of interest from the processed mat. */
    const extractRidgePoints = (mat: any) => {

        const data = mat.data;
        const ridge = []

        for (let x = 0; x < mat.cols; x++) {
            for (let y = 0; y < mat.rows; y++) {

                // row 0 is from 0 to 399, 
                // row 1 is from 400 to 799, 
                // so  take first index of row (ranges from 0 to cols*rows)
                // and add current index in row (iterated over cols)
                const value = data[y * mat.cols + x];

                if (value > 0) {
                    ridge.push({ x, y })
                    // runs faster the upper the edge is!
                    break;
                }
            }

        }

        console.log("extracted ridge:", ridge)

        return ridge;

    }


    // unwichtiges todo: wie typen wir sowas? 
    // so. aber hier kein definierter typ wie "Point" oder so.

    /**Applies Gaussian smoothing to the ridge point array to  */
    const smoothRidgePoints = (ridge: Point[]) => {

        const kernel = [1, 4, 6, 4, 1];
        const radius = 2;

        const out: { x: number; y: number }[] = [];

        for (let i = 0; i < ridge.length; i++) {

            let weighted = 0;
            let weightSum = 0;

            for (let k = -radius; k <= radius; k++) {

                const idx = i + k;

                if (idx < 0 || idx >= ridge.length)
                    continue;

                const weight = kernel[k + radius];

                weighted += ridge[idx].y * weight;
                weightSum += weight;
            }

            out.push({
                x: ridge[i].x,
                y: weighted / weightSum
            });
        }

        console.log("smoothed ridge:", out)
        return out;

    }

    const extractPois = (ridge: Point[]) => {

        //return [];

        const out: Point[] = [];

        const neigbourCount = 10;
        // first ones free? hängt davon ab ob man beim rect anfängt oder erst beim ersten gipfel, der ggf früh nachm strich kommt
        //out.push(ridge[0])



        for (let l = neigbourCount; l < (ridge.length - neigbourCount); l++) {


            let neighbours = [];

            // iterate over neighbourCount* neighbours of ridge[l]
            for (let i = l - neigbourCount; i <= l + neigbourCount; i++) {
                if (i < 0 || i >= ridge.length) {
                    // wird eh nix drin sein
                    console.log("nix neighbours", i)
                    neighbours = [];
                    continue;
                };

                // save 3 neihgbours of current point
                neighbours.push(ridge[i])

            }


            // safety catch for edge cases (indeed at the edge)
            if (neighbours.length != (neigbourCount * 2 + 1)) {

                console.log("neighbors not", (neigbourCount * 2 + 1), neighbours)
                neighbours = [];
                continue;
            }


            // TODO: naheliegende extrema weghauen!
            // aber gefahr: wenn z.b. nur sehr weggezoomtes bild ist, liegen die tatsächlich guten extrema trz nah beieinander!
            // aber vielleicht dann einfach user problem, der user soll halt reinzoomen dass es passt.


            // IDEE: aktuell komen zu viele randoms, und zu viele gute kommen nicht.
            // - was, wenn man v.l.n.r vorgeht und bisschen großzügiger bewertet, d.H. 
            // z.b. mit nem scope von 2 nachbarn auf jeder seite, und wenn z.b. 3/5 das kriterium erfüllen, dann poi? 
            // und rest klärt sich dann 

            // wenn hier 0 <= 1 > 2 ist, dann ist auch __. und dann nach unten drinnen

            // Vielleicht kann man daraus so richtige knickpunkte ablesen, die sind ggf aussagekräftiger als spitzen, die ggf. zu knapp sind,

            // TODO: middle raussuchen, (ridge[l])//
            // alle außer dem mitnander vergleichen!
            // z.b. 2 können gleich sein, 2 müssen niedriger sein?

            // so kann man genauer sein: z.b wenn die vorderen 2/3 lower sind und der 1/3 gleich, gut - gleichzeitigen die nächsten auch lower oder gleich,
            // das nimmt dann auch so anfänge von bergkuppen an! aber reine random punkte an slopes!

            // am besten mit for-schleife über alle neighs drüber, und das mittlere skippen.
            // dann statistik machen.


            // TODO: ACHTUNG!!!!!!!!!!!!!!!!
            // höheres Y = niedriger, da y=0 ganz oben ist haha
            //
            // funktioniert hier trotzdem, aus dummheit!
            // weil normalerweise ist n higher, wenn n.y > middleman.y
            // aber hab ich hier andersrum gemacht, ich schlau!
            const middleman = ridge[l]

            // xy-count: n ist (lower/higher) als middleman-count
            let sameCount = 0;
            let lowerCount = 0;
            let higherCount = 0;

            for (let n of neighbours) {
                if (n === middleman) continue;

                if (n.y > middleman.y) lowerCount++;
                if (n.y < middleman.y) higherCount++;
                if (n.y == middleman.y) sameCount++;
            }



            // maximum: min. eine seite ist <, eine seite ist =, die andere muss 0/minimal sein sein


            // minverdacht
            if (lowerCount == 0) {


                const higherRate = higherCount / sameCount;
                // bei 1: gleich viele. bei >1: mehr higher als gerade. 
                // 

                // vielleicht kann auch so 1 toleranz-higher drin sein!
                if (higherRate >= 1) {
                    // out.push(middleman)
                    console.log("min:", middleman, "rate", higherRate)
                    out.push(middleman)
                    l += 5;
                }
            }


            // maxverdacht
            if (higherCount == 0) {

                const lowerRate = lowerCount / sameCount;

                if (lowerRate >= 1) {
                    console.log("max", middleman, " rate: ", lowerRate)
                    out.push(middleman)
                    l += 5;
                }
            }





            /** Old bums
            if ((neighbours[0].y < neighbours[1].y && neighbours[1].y > neighbours[2].y)) {
                // minimum or maximum
                out.push(neighbours[1])
                console.log("maximum found:", neighbours[1])
            }
            if ((neighbours[0].y > neighbours[1].y && neighbours[2].y > neighbours[1].y)) {
                out.push(neighbours[1])
                console.log("minimum found:", neighbours[1])
            } */

            neighbours = [];

        }

        return out;
    }

    const displayMat = (mat: any) => {


        // Hier immer current enforcen, damit da auch safe kein undefined drin ist.
        // checkt der sonst nicht.
        // obwohl das eig schon oben gemacht wurde..
        cv.imshow(outputCanvasRef.current!, mat);

    }


    const drawPointsOnMat = (points: { x: number; y: number }[], inMat: any) => {

        const overlay = inMat.clone();

        const overlayRgba = new customMat(cv, overlay).gray2rgba().toCvMat();
        console.log(overlayRgba.channels())
        // return;
        for (const p of points) {
            cv.circle(
                overlayRgba,
                new cv.Point(p.x, p.y),
                1,
                new cv.Scalar(0, 0, 255, 255),
                -1
            );
        }



        cv.imshow(outputCanvasRef.current!, overlayRgba)
        //overlay.delete();
        //inMat.delete();


    }

    const startTone = async () => {

        if (soundConverter.current) return;

        await Tone.start();

        console.log("Tone ready")
        setSoundReady(true)
        soundConverter.current = new SoundConverter();


    }


    // TODO: ggf. await bis die pois geladen sind.
    const play = () => {

        if (!finalPois.current) {
            console.log("no pois yet to play!")
            return;
        }
        soundConverter.current?.playNotes()
        soundConverter.current?.convertPOIs(finalPois.current);

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
                <canvas ref={outputCanvasRef} id="processedOutputCanvas"></canvas>
                <button onClick={startTone}>Start Tone</button>
                {soundReady && (<button onClick={play}>Play Sound</button>)}
            </div>


        </div>
    ))



}
export default OpenCVComponent;

