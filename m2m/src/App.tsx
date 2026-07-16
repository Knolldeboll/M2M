import { useEffect } from 'react'


import './App.css'


function App() {


  // const [loaded, setLoaded] = useState(false);

  // Source - https://stackoverflow.com/a/11381730
  // Posted by Michael Zaporozhets, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-07-11, License - CC BY-SA 4.0



  return (

    /* Da kommt eigentlich noch "onLoaded = () => {} und openCvPath rein..
     aber das erste funktioniert nicht und wenn man nen Path angibt lädt opencv nicht" */

    /** Es ist so, dass man opencv.js entweder selber bauen kann - diesen kann man dann mit dem prop "openCvPath" hier angeben - 
     * oder man gibt nix an, dann zieht der sich die lib von https://docs.opencv.org/3.4.20/opencv.js oder so runter.
     * Dauert jetzt auch nicht ewig zum laden, von dem her kein Problem.
     * ggf. sollte man das in ner echten Anwendung cachen, damit das nicht jedes mal geladen werden muss.
     * Auch: wenn der Service von denen mal down ist, dann Problem. 
     * Am besten eig. selber bauen und dann hier angeben.
     */



  )
}

export default App;
