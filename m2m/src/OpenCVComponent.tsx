import { useEffect, useRef, useState } from "react";
//import { extractRidgePoints, smoothRidgePoints, extractPois } from "./services/extraction.ts";
import * as Tone from "tone";
import "./types.ts";

//import berge from "./assets/berge.jpeg";
import berge from "./assets/bergeZoomed.jpg";
//import ProcessableMat from "./processableMat.tsx"
import SoundConverter from "./SoundConverter";
import type { Point } from "./types.ts";

import CvProcessor from "./services/CvProcessor.ts";
import {
  extractPois,
  extractRidgePoints,
  smoothRidgePoints,
} from "./services/extraction.ts";
import { drawPointsOnMat } from "./services/cvUtils.ts";

interface OpenCVComponentProps {
  img?: string;
}

//Just following the tutorial at https://docs.opencv.org/3.4.20/d0/d84/tutorial_js_usage.html

/**Component containing business logic for extracting POIs from captured Image and providing a
 * canvas to display extraction results  */
const OpenCVComponent = ({}: OpenCVComponentProps) => {
  // useOpenCv() geht, weil um dieses Component ein CvProvider drum ist!

  //const { loaded, cv } = useOpenCv();

  // const { loaded, cv } = useOpenCv();
  const inputRef = useRef<HTMLInputElement>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  //const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  // const [imgSrcURL, setImgSrcURL] = useState<string | null>(null);

  const finalPois = useRef<Point[] | null>(null);
  const rows = useRef<number>(null);

  const soundConverter = useRef<SoundConverter | null>(null);
  const [soundReady, setSoundReady] = useState(false);

  const [cvProcessor, setCvProcessor] = useState<CvProcessor | null>(null);

  console.log("component");

  // useEffect hier, um async-Stuff in React-Components aufzurufen!
  // hier wird auch state geändert, (je nach Status des Promises)

  // Kann man noch in ne custom Hook extracten

  useEffect(() => {
    console.log("useEffect cvprocessor loading");
    async function init() {
      const p = await CvProcessor.create();

      setCvProcessor(p);
      console.log("cvProcessor ready!", cvProcessor);
    }

    init();
  }, []);

  /**Convert the inputs file to a url and set the imgs src to it. */
  /*
    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("file changed")
        setImgSrcURL(URL.createObjectURL((event.target as HTMLInputElement).files![0]));
    }

    */

  /**When img element loads its iamge, process it into a mat and show it on the canvas. */

  /*
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
        */

  /** Aus nem canvas 2d context die imagedata rausziehen, dann daraus ein mat generieren.
   * imagedata braucht man ggf. zum filtern bzw. aufbereiten des bilds, oder auch um drauf zu arbeiten!
   */

  /*
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

               // Dieses Mat könnte jetzt noch processed werden, z.b. farben convert oä
               // srcmat auf canvas anzeigen.
               cv.imshow(outputCanvasRef.current!, srcMat)
        

        // Alternativ kann man auch statt imshow das Mat wieder direkt auf den canvas context schreiben: 
        // ggf. braucht man das beim processing von so bilddaten.

        displayImgDataOnCanvas(imgData)


    }

*/

  /**Man kann auch imgData wieder in den 2d-context eines canvases schreiben, um anzuzeigen
   * -- ggf. interessant, wenn man imgData manipulieren möchte. oder wenn man Camera-Frames anzeigen möchtes.
   */

  /*
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
*/

  // TODO: display rect to be clipped on the original input canvas (image or video)

  // Achtung: stand jetzt kommt auch immer n anderes rect, je nch screen size... BRO

  /*
    const rectify = (inMat: any) => {
        if (!imgRef.current || !outputCanvasRef.current) {
            console.log("no img or no output canvas")
            return;
        }

        // Dreck: das ist in pixeln und nicht responsive in %.
        // muss man ggf. anhand der bildschirmgröße neu berechnen.
        // z.B. bilschirm ist 600px lang und 400px breit: dann soll margin davon je 10% sein.
        // d.h. 60, 40, 540 560


        //Achtung: das ist X Y W H Kollege. also x/y = 50%vw/vh, width/height je 90% vw/vh

        // die w/h entspricht später den columns/rows der mat
        let rect = new cv.Rect(255, 120, 400, 100);


        return inMat.roi(rect);

    }

    */

  /** Main Method for processing image from img element, called un user button press */

  /*
  const processImg = () => {
    if (!imgRef.current || !outputCanvasRef.current) {
      console.log("no img or no output canvas");
      return;
    }

    const img = imgRef.current;
    const rawMat = cv.imread(img);
    const displayRawMat = rawMat.clone();

    //const rectMat = rectify(rawMat);
    //

    //  use customMat class for applying filters in chained way
    const processedMat = new ProcessableMat(cv, rawMat)
      .rgb()
      .bilateralFilter()
      .gray()
      .medianBlur(5)
      .canny()
      .toCvMat();

    rows.current = processedMat.rows;
    console.log("rows:", rows.current);

    // point[]-returning operations

    const extracted = extractRidgePoints(processedMat);

    const smoothened = smoothRidgePoints(extracted);

    const pois = extractPois(smoothened);

    finalPois.current = pois;

    // packt die pois aufs canny-mat und displayt das dann auf dem canvas!

    //drawPointsOnMat(pois, processedMat, 3, "gray")

    // displayMat(displayRawMat);

    drawPointsOnMat(pois, displayRawMat, 3, "rgba");

    //cleanup - failt aber, anscheinend wird inen bums noch gerbaucht
    // processedMat.delete();
    // rectMat.delete();
    // rawMat.delete();

    // TODO: Display pois on image. attention:
    //       must draw them in the overlaid ROI, not on the raw image of cam-input-size!
    return;
  };

*/

  const startTone = async () => {
    if (!finalPois.current) {
      console.log("no pois yet to convert!");
      return;
    }

    await Tone.start();
    console.log("Tone ready");

    if (!soundConverter.current) {
      soundConverter.current = new SoundConverter(2, "C4");
    }

    soundConverter.current?.convertPOIs(finalPois.current, rows.current!);
    //soundConverter.current?.playTest();
    setSoundReady(true);
    // n = number of notes around key, including key!
    // so n = 8: key-> upper = 8 notes, key -> lower = 8, -1 (key not duplicated) = 15
  };

  // TODO: ggf. await bis die pois geladen sind.
  const play = () => {
    console.log("sc present? ", soundConverter.current);
    soundConverter.current?.playNotes();
  };

  const convertImage = () => {
    console.log("convertimage callback ");

    if (!cvProcessor) {
      console.log("no cvprocessor object!");
      return;
    }

    if (!imgRef.current) {
      console.log("no imgref");
      return;
    }

    let processedMat = cvProcessor.processImgIntoEdgeMat(imgRef.current);
    console.log("process result", processedMat);

    rows.current = processedMat.rows;

    let ridge = extractRidgePoints(processedMat);
    let smoothened = smoothRidgePoints(ridge);
    let pois = extractPois(smoothened);

    finalPois.current = pois;

    drawPointsOnMat(
      pois,
      processedMat,
      undefined,
      "gray",
      outputCanvasRef.current!,
    );
    // nun display auf mat:
    // Nun extract:
  };

  //TODO: wenn nicht loaded, dann so spinner oder so.

  // TODO: Checken, ob die lib "opencv-react" wirklich so nice ist - denn wer weiß, was da für ne Version von opencv.js geladen wird?

  // Das IMG-Element (oder ggf. auch canvas-2D-context) kommt dann später als Prop hier rein, das muss

  if (cvProcessor) {
    console.log("cvprocesser ready");
    return (
      <div className=" w-full flex flex-col ">
        <div className="w-[80%] max-w-200 mx-auto">
          <img
            className="w-full"
            ref={imgRef}
            src={berge}
            onLoad={() => console.log("img loaded")}
            id="imageSrc"
            alt="No Image"
          />
        </div>

        <div className="w-full h-full fixed top-0 left-0">
          <canvas
            className="w-full"
            ref={outputCanvasRef}
            id="processedOutputCanvas"
          ></canvas>
          <button onClick={startTone}>Start Tone TEST</button>
          <button
            onClick={convertImage}
            className="fixed top-[90%] left-[45%] bg-amber-50 p-2"
          >
            Convert Image
          </button>
          {soundReady && <button onClick={play}>Play Sound</button>}
        </div>
      </div>
    );
  } else {
    console.log("cvprocesser loding");
    return <div className="w-full h-full bg-amber-900">LOADING</div>;
  }
};
export default OpenCVComponent;
