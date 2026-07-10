// converts POI array to sounds and plays them.
import * as Tone from "tone";
import type { Point } from "./types";



console.log("SoundConverter module loaded", Date.now());

class SoundConverter {


    // Notes to match POIs to
    private scaleNotes: any[];

    private finalNotes: any[] | undefined;
    // über wieviele halbtöne um den key rum reden wir? z.B. 8 ist insg. 2 oktaven
    private scaleSize;
    private majorSteps = [2, 2, 1, 2, 2, 2, 1];

    private synth = new Tone.PolySynth(Tone.Synth).toDestination();


    constructor(scaleSize: number, root: string) {
        this.scaleNotes = [];
        this.scaleSize = scaleSize;
        this.generateScale(Tone.Midi(root));


    }

    private generateScale = (rootMidi: any) => {
        console.log("scalesize mep mep", this.scaleSize)

        let scaleSteps = [0];

        let interval = 0;

        for (let i = 1; i < this.scaleSize; i++) {
            interval += this.majorSteps[(i - 1) % this.majorSteps.length];
            scaleSteps.push(interval);
        }


        console.log("generated major scale steps: ", scaleSteps)

        let higherNotes = scaleSteps.map(step =>
            Tone.Frequency(rootMidi + step, "midi").toNote()
        )

        let lowerNotes = scaleSteps.slice(0, -1).map(step =>
            Tone.Frequency(rootMidi - 12 + step, "midi").toNote()
        )

        this.scaleNotes.push(...lowerNotes, ...higherNotes)

        console.log("generated scale:", this.scaleNotes)
    }



    public convertPOIs = (pois: Point[], roiHeight: number) => {

        const stepHeights = []
        const stepSize = roiHeight / this.scaleNotes.length;

        // also already flip the whole list, so that
        // inverted y fits to "lower notes being on lower extrema with higher y value"


        //1. distribute scale across height of output screen
        //   : for 2* octave, stepsize is height(/2*scale).
        // then start at height to height-stepsize, height-stepsize*2 etc.


        // Achtung: keine Gefahr: die roiHeight ist immer fix! und die y-Werte sind immer von 
        // 0 bis roiHeight, auch bei screen resize.
        // bei screen resize sind einfach nur die ridgepunkte anders, weil anders extrahiert wird...

        for (let i = 0; i < this.scaleNotes.length; i++) {
            stepHeights.push(i * stepSize)
        }


        console.log("steps for poi convert:", stepHeights)


        //2. match  pois to these n steps

        // dazu erstmal scaleNotes umdrehen, weil kleineres y = höherer Ton!

        let flippedScale = this.scaleNotes.toReversed();


        let finalNotes = [];


        for (let p of pois) {


            for (let i = 0; i < stepHeights.length; i++) {

                // entweder bei direct hit, deckt aber auch edgecases 0 und ymax ab!
                if (p.y == stepHeights[i]) {
                    console.log("py is ", stepHeights[i], " converted to note ", flippedScale[i])
                    finalNotes.push(flippedScale[i])
                    break;
                }

                if (!(p.y > stepHeights[i])) {
                    let index = Math.abs(p.y - stepHeights[i - 1]) < Math.abs(p.y - stepHeights[i]) ? i - 1 : i
                    console.log("py", p.y, "between ", stepHeights[i - 1], "/", stepHeights[i], "matched to ", stepHeights[index], "converted to note ", flippedScale[index])
                    finalNotes.push(flippedScale[index])
                    break;
                }

                // match p.y to one value out of stepHeights
                // wenn bisher nix kam, weil y = rand: push letzte note
            }

        }

        console.log("final notes; ", finalNotes)


        this.finalNotes = finalNotes;


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

    public playNotes = (notes: number[] = this.scaleNotes) => {
        // notes = this.scale[0]

        if (!this.finalNotes) return;

        console.log("playnotes")
        const now = Tone.now();
        let delay = 0;

        for (let t of this.finalNotes) {

            this.synth.triggerAttackRelease(t, "64n", now + delay);
            delay += 0.2
        }

    }
} export default SoundConverter;