// converts POI array to sounds and plays them.
import * as Tone from "tone";
import type { Point } from "./types";



console.log("SoundConverter module loaded", Date.now());

class SoundConverter {

    private scale: any[];
    private majorSteps = [0, 2, 4, 5, 7, 9, 11, 12];
    private synth = new Tone.PolySynth(Tone.Synth).toDestination();

    // über wieviele oktaven verteilen sich die töne? z.b. 1 unter base, 1 über base = 2 
    private octaveCount = 2;

    constructor() {
        this.scale = [];
        this.generateScale(Tone.Midi("C4"));
        console.log("SC rettich")
        // this.playNotes(this.scale);
    }

    private generateScale = (rootMidi: any) => {


        let higherNotes = this.majorSteps.map(step =>
            Tone.Frequency(rootMidi + step, "midi").toNote()
        )


        let lowerNotes = this.majorSteps.slice(0, -1).map(step =>
            Tone.Frequency(rootMidi - 12 + step, "midi").toNote()
        )

        this.scale.push(...lowerNotes, ...higherNotes)


        console.log("generated scale:", this.scale)
    }



    public convertPOIs = (pois: Point[], roiHeight: number) => {

        const stepHeights = []
        const stepSize = roiHeight / this.scale.length;

        // also already flip the whole list, so that
        // inverted y fits to "lower notes being on lower extrema with higher y value"


        //1. distribute scale across height of output screen
        //   : for 2* octave, stepsize is height(/2*scale).
        // then start at height to height-stepsize, height-stepsize*2 etc.


        // Achtung: keine Gefahr: die roiHeight ist immer fix! und die y-Werte sind immer von 
        // 0 bis roiHeight, auch bei screen resize.
        // bei screen resize sind einfach nur die ridgepunkte anders, weil anders extrahiert wird...

        for (let i = 0; i <= this.scale.length; i++) {
            stepHeights.push(i * stepSize)
        }


        console.log("steps for poi convert:", stepHeights)


        //2. match  pois to these n steps

        //3. from the index of the closest step, get the corresponding note of the scale




    }



    // Convert POIs to notes within the scale.. old approach that squashes the octave between
    // the base and the most extreme absolute extrema
    public convertPOIsOptimized = (pois: Point[]) => {

        // ACHTUNG: niedrigeres Y: höher xD
        const base = pois[0];

        // find borders

        /*
        const highest = pois.slice(1).reduce((max, current) => current.y < max.y ? current : max)
        const lowest = pois.slice(1).reduce((max, current) => current.y > max.y ? current : max)


        // find most extreme border
        const hDist = (Math.abs(base.y - highest.y))
        const lDist = (Math.abs(base.y - lowest.y))
        const referenceBorder = hDist > lDist ? { point: highest.y, distance: hDist } : { point: lowest.y, distance: lDist }
        console.log("conPois: base ", base, " highes", highest, "lowest", lowest, "extremest:", referenceBorder)
*/


        return;

        // iteratively figure out the best configuration of divisions between base and referenceborder

        // for 1 step:  delta(base to referenceBorder) is stepsize, 1 step.
        // for 2 step: delta(base to refBorder)/2 is stepsize, 2 steps from base to refborder.

        // dann liste mit steps populaten:
        // base soll die mitte sein, aussenrum ja jeweils z.b. 2 steps.
        // am besten machen wir dann: starten bei base.y+(i)*stepsize, i startet bei -steps, endet bei steps
        // also  base.y+(-2*stepsize), bis base.y+(2*stepsize)

        // konkret: z.B. base ist 50, extremum ist 60, diff dazwischen ist 10. 
        // jetzt ist z.b. stepsize bei 2 steps bis zum extremum 10/2 = 5.
        // also populaten wir mit base-10, base-5, base, base+5, base +10

        // da machen wir dann den quality check für die anzahl steps-konfiguration. 

        // wenn das fertig, kommen wir mit ner anzahl an steps raus, die optimal sind. 



        // TODO: implement quality of division-config measuring algorithm: 
        //

        // TODO: implement poi-to-divisionline-mapping-algo
        // TODO: Erstmal mit ner festgelegten anzahl an Halbtönen testen... 



        console.log("pois ", pois, "base: ", base, "highest:", highest, "lowest", lowest)


        // then iteratively figure out, how many steps are between base and furthest-away


    }


    /*checks the quality of some points to some borders,  */
    private checkDistributionQuality = (borders, points) => {

    }

    // plays the previously generated scale!
    // must smh match the progess bar of the UI 
    // TODO: calculate a duration here, pass it to the main component.
    // start the progress bar at the same time as calling and let it run for the duration!

    public playNotes = (notes: number[] = this.scale) => {
        // notes = this.scale[0]

        console.log("playnotes")
        const now = Tone.now();
        let delay = 0;



        for (let t of notes) {

            this.synth.triggerAttackRelease(t, "64n", now + delay);
            delay += 0.2
        }

    }
} export default SoundConverter;