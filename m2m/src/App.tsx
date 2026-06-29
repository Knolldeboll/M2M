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
    <OpenCvProvider  >
      <OpenCVComponent></OpenCVComponent>
    </OpenCvProvider>


  )
}

export default App;
