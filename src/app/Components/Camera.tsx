import React from 'react'
import Webcam from "react-webcam";
import { CameraProps } from '../types';

const Camera = ({webcamRef, canvasRef, loaded}: CameraProps) => {
  return (
    <div className="flex items-center justify-center h-screen relative">
    {
      !loaded &&
      <p className="absolute top-[5%] text-pretty text-xl text-black ">Please wait for the detector to load.....</p>
    }
    {
      loaded &&
      <p className="absolute top-[5%] text-pretty text-xl text-black italic">Detecting</p>
    }
      <Webcam ref={webcamRef} className={` ${!loaded ? "blur-lg w-[440px] h-[360px] md:w-[640px] md:h-[480px]" : "w-[440px] h-[360px] md:w-[640px] md:h-[480px]"}`}
      />
      <canvas ref={canvasRef} className="absolute w-[440px] h-[360px] md:w-[640px] md:h-[480px]"
      />
     
    </div>   
  )
}

export default Camera