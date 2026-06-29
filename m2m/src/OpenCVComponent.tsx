import { useRef, useState } from "react";
import { useOpenCv } from "opencv-react";

interface OpenCVComponentProps {
}


/** Just following the tutorial at https://docs.opencv.org/3.4.20/d0/d84/tutorial_js_usage.html */
const OpenCVComponent = ({ }: OpenCVComponentProps) => {


    const input = useRef<HTMLInputElement>(null);
    const imgElement = useRef<HTMLImageElement>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("file changed")
        setImgSrc(URL.createObjectURL((event.target as HTMLInputElement).files![0]));

        // Mat: matrix mit Pixeln drin oder so. 
        // Wird hier aus dem img-Element rausgezogen, nicht aus der darin angezeigten file!
        const mat = cv.imread(imgElement.current!)

        cv.imshow("outputCanvas", mat);
        console.log("quak")


    }

    const { loaded, cv } = useOpenCv();



    //TODO: wenn nicht loaded, dann so spinner oder so.

    // TODO: Checken, ob die lib "opencv-react" wirklich so nice ist - denn wer weiß, was da für ne Version von opencv.js geladen wird?
    return (loaded && (
        <div>
            <div className="inputoutput">
                <img ref={imgElement} src={imgSrc || undefined} id="imageSrc" alt="No Image" />
                <div className="caption">imageSrc <input ref={input} type="file" id="fileInput" name="file" onChange={onFileChange} /></div>
            </div>

            <div className="inputoutput">
                <canvas id="outputCanvas"></canvas>
            </div>

        </div>
    ))



}
export default OpenCVComponent;

