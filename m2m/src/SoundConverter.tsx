// converts POI array to sounds and plays them.
import * as Tone from "tone";
import type { Point } from "./types";



console.log("SoundConverter module loaded", Date.now());

class SoundConverter {

    private scale: any;
    private majorSteps = [0, 2, 4, 5, 7, 9, 11, 12];
    private synth = new Tone.Synth().toDestination();

    // über wieviele oktaven verteilen sich die töne? z.b. 1 unter base, 1 über base = 2 
    private octaveCount = 2;

    constructor() {

        this.generateScale(Tone.Midi("C3"));
        console.log("SC rettich")
        // this.playNotes(this.scale);
    }

    private generateScale = (rootMidi: any) => {


        this.scale = this.majorSteps.map(step =>
            Tone.Frequency(rootMidi + step, "midi").toNote()
        )
        console.log("generated scale:", this.scale)
    }


    // Convert POIs to notes within the scale
    public convertPOIs = (pois: Point[]) => {

        // ACHTUNG: niedrigeres Y: höher xD
        const base = pois[0];

        // find borders

        const highest = pois.slice(1).reduce((max, current) => current.y < max.y ? current : max)
        const lowest = pois.slice(1).reduce((max, current) => current.y > max.y ? current : max)


        console.log("conPois: base ", base, " highes", highest, "lowest", lowest)
        // find most extreme border
        const hDist = (Math.abs(base.y - highest.y))
        const lDist = (Math.abs(base.y - lowest.y))
        const referenceBorder = hDist > lDist ? hDist : lDist

        return;

        // iteratively figure out the best configuration of divisions between base and referenceborder

        // for 1 step:  delta(base to referenceBorder) is stepsize, 1 step.
        // for 2 step: delta(base to refBorder)/2 is stepsize, 2 steps from base to refborder.



        // TODO: implement quality of division-config measuring algorithm: 
        // TODO: implement poi-to-divisionline-mapping-algo
        // TODO: Erstmal mit ner festgelegten anzahl an Halbtönen testen... 



        console.log("pois ", pois, "base: ", base, "highest:", highest, "lowest", lowest)


        // then iteratively figure out, how many steps are between base and furthest-away


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
            console.log("note   sadded", t)
            this.synth.triggerAttackRelease(t, "8n", now + delay);
            delay += 0.2
        }

    }
} export default SoundConverter;