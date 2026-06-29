import { useState } from 'react'
import { useRef } from 'react'
import { OpenCvProvider } from 'opencv-react'

import './App.css'
import OpenCVComponent from './OpenCVComponent';

function App() {


  const [loaded, setLoaded] = useState(false);


  return (

    /* Da kommt eigentlich noch "onLoaded = () => {} und openCvPath rein..
     aber das erste funktioniert nicht und wenn man nen Path angibt lädt opencv nicht" */

    /** Es ist so, dass man opencv.js entweder selber baut - das kann man dann mit dem prop "openCvPath" hier angeben - 
     * oder man gibt nix an, dann zieht der sich die lib von https://docs.opencv.org/3.4.20/opencv.js oder so runter.
     * Dauert jetzt auch nicht ewig, von dem her kein Problem.
     * ggf. sollte man das in ner echten Anwendung cachen, damit das nicht jedes mal geladen werden muss.
     */
    <OpenCvProvider  >
      <OpenCVComponent></OpenCVComponent>
    </OpenCvProvider>


  )
}

export default App;
