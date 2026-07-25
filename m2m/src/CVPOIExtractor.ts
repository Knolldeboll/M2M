import customMat from "./customMat";
import { getCv } from "./OpenCVLoader";
import type { Point } from "./types";

// TODO: import cv from npm library/build

class CVPOIExtractor {
  private rows: number | undefined;
  private finalPois: any[] | undefined;
  private inputCanvas: HTMLCanvasElement | undefined;

  // Statt nur dem, sollte vielleicht auch "minDistY" zählen: so können nahe, aber doch vom y her sehr verschiedene
  // Points berücksichtigt werden, z.b. bei sehr steilem abfall, dann aber mit kante drin. oder krassem zickzack
  private extractPOIDistance = 10;

  // neighbourcount: zwischen wievielen neighbours soll die same/higher/lowerrate ermittelt werden?
  // bisschen so die "Eindeutigkeit" von extrema
  private neighbourCount = 25;

  constructor() {
    this.rows = undefined;
    this.finalPois = undefined;
    this.inputCanvas = undefined;

    // Blockt einfach so. Da machen wir am besten dieses Ding mit der Static async methode,
    // die nach abschluss erst den Constructor aufruft um ein vollständiges object zu generieren.
    const cv = getCv();

    console.log("cv loaded", cv);
  }

  /** Main Method for processing image Data from img element into POIs */
  /** Main Method for processing image from img element */
  public processImg = (inputImg: HTMLImageElement) => {
    // TODO:
    if (!cv) {
      console.log("cv not ready.");
      return;
    }

    console.log("process img");

    const img = inputImg;
    const rawMat = cv.imread(img);

    //const displayRawMat = rawMat.clone();

    //const rectMat = rectify(rawMat);
    //

    //  use customMat class for applying filters in chained way
    const processedMat = new customMat(cv, rawMat)
      .rgb()
      .bilateralFilter()
      .gray()
      .medianBlur(5)
      .canny()
      .toCvMat();

    this.rows = processedMat.rows;
    console.log("rows:", this.rows);

    // point[]-returning operations

    const extracted = this.extractRidgePoints(processedMat);
    const smoothened = this.smoothRidgePoints(extracted);

    const pois = this.extractPois(smoothened);

    this.finalPois = pois;

    // packt die pois aufs canny-mat und displayt das dann auf dem canvas!

    //drawPointsOnMat(pois, processedMat, 3, "gray")

    // displayMat(displayRawMat);

    // drawPointsOnMat(pois, displayRawMat, 3, "rgba");

    //cleanup - failt aber, anscheinend wird inen bums noch gerbaucht
    // processedMat.delete();
    // rectMat.delete();
    // rawMat.delete();

    // TODO: search pois in (smothened) ridge
    // TODO: Display pois on image. attention:
    //       must draw them in the overlaid ROI, not on the raw image of cam-input-size!
    return;
  };

  /** Aus nem canvas 2d context die imagedata rausziehen, dann daraus ein mat generieren.
   * imagedata braucht man ggf. zum filtern bzw. aufbereiten des bilds, oder auch um drauf zu arbeiten!
   *
   */

  /**
   * @param context canvascontext2D
   * @returns mat
   */
  private matFromCanvas = (canvas: HTMLCanvasElement) => {
    console.log("mat from canvas");

    const context = canvas.getContext("2d");

    if (!context) {
      console.log("no canvas 2d context");
      return;
    }

    // canvas context und getImageData sind vanilla.
    let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    // generiert ein mat aus imgData
    let srcMat = cv.matFromImageData(imgData);

    console.log("mat from canvas result: ", srcMat);

    return srcMat;
  };

  /**Extract points of interest from the preprocessed mat. */
  private extractRidgePoints = (mat: any) => {
    console.log("extract Ridge Points");
    const data = mat.data;
    const ridge: Point[] = [];

    for (let x = 0; x < mat.cols; x++) {
      for (let y = 0; y < mat.rows; y++) {
        // row 0 is from 0 to 399,
        // row 1 is from 400 to 799,
        // so  take first index of row (ranges from 0 to cols*rows)
        // and add current index in row (iterated over cols)
        const value = data[y * mat.cols + x];

        if (value > 0) {
          ridge.push({ x, y });
          // quits faster the upper the edge is!
          break;
        }
      }
    }

    console.log("extracted ridge:", ridge);

    return ridge;
  };

  /**Applies Gaussian smoothing to the ridge point array to  */
  private smoothRidgePoints = (ridge: Point[]) => {
    console.log("smooth Ridge Points");
    const kernel = [1, 4, 6, 4, 1];
    const radius = 2;

    const out: { x: number; y: number }[] = [];

    for (let i = 0; i < ridge.length; i++) {
      let weighted = 0;
      let weightSum = 0;

      for (let k = -radius; k <= radius; k++) {
        const idx = i + k;

        if (idx < 0 || idx >= ridge.length) continue;

        const weight = kernel[k + radius];

        weighted += ridge[idx].y * weight;
        weightSum += weight;
      }

      out.push({
        x: ridge[i].x,
        y: weighted / weightSum,
      });
    }

    console.log("smoothed ridge:", out);
    return out;
  };

  // TODO: Check what happens at infinity (/0) - is this good as is?
  private extractPois = (ridge: Point[]) => {
    console.log("extract POIs");
    //return [];

    const out: Point[] = [];

    // first ones free? hängt davon ab ob man beim rect anfängt oder erst beim ersten gipfel, der ggf früh nachm strich kommt
    //out.push(ridge[0])

    // get neighbours
    for (
      let l = this.neighbourCount;
      l < ridge.length - this.neighbourCount;
      l++
    ) {
      let neighbours = [];
      // iterate over neighbourCount* neighbours of ridge[l]
      for (let i = l - this.neighbourCount; i <= l + this.neighbourCount; i++) {
        if (i < 0 || i >= ridge.length) {
          // wird eh nix drin sein
          console.log("nix neighbours", i);
          neighbours = [];
          continue;
        }

        neighbours.push(ridge[i]);
      }

      // safety catch for edge cases (indeed at the edge)
      if (neighbours.length != this.neighbourCount * 2 + 1) {
        console.log("neighbors not", this.neighbourCount * 2 + 1, neighbours);
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
      const middleman = ridge[l];

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
          console.log("min:", middleman, "rate", higherRate);
          out.push(middleman);
          l += this.extractPOIDistance;
        }
      }

      // maxverdacht
      if (higherCount == 0) {
        const lowerRate = lowerCount / sameCount;

        if (lowerRate >= 1) {
          console.log("max", middleman, " rate: ", lowerRate);
          out.push(middleman);
          l += this.extractPOIDistance;
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
  };
}
export default CVPOIExtractor;
