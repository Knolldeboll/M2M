import { useRef } from "react";

/*When image is taken, passes it to the cvcomponent which is then displayed,*/
const CameraFrame = () => {
  // Video for input, canvas for storing results, image for output.
  //  canvas hidden - only for processing!

  const videoRef = useRef<HTMLVideoElement>(null);
  const processCanvasRef = useRef(null);

  const initVideo = () => {
    if (!videoRef.current) {
      console.error("no videoref");
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        videoRef.current!.srcObject = stream;
        videoRef.current!.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });
  };

  return (
    <>
      <div>
        <video ref={videoRef}></video>
        <canvas ref={processCanvasRef}></canvas>
      </div>

      <div id="ui">
        <button onClick={initVideo}>Start Video</button>
      </div>
    </>
  );
};

export default CameraFrame;
