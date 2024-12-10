'use client';
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import "@tensorflow/tfjs-backend-webgl";
import * as handpose from "@tensorflow-models/handpose";
import { HandPose } from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawMesh, drawHand } from "./utils";
import Camera from "./Components/Camera";

export default function Home() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [faceSelected, setFaceSelected] = useState<boolean>(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false); 

  useEffect(() => {
    const setupBackend = async () => {
      if (!tf.engine().findBackend("webgl")) {
        await tf.setBackend("webgl");
      }
      await tf.ready();
      console.log(`Backend initialized: ${tf.getBackend()}`);
    };

    setupBackend();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const runFaceMesh = async () => {
      const net = await facemesh.load({
        maxFaces: 2,
        detectionConfidence: 0.9,
      });
      interval = setInterval(() => runDetect(net), 50);
    };

    const runHandpose = async () => {
      const net = await handpose.load();
      interval = setInterval(() => detect(net), 50);
    };

    if (faceSelected) {
      setLoaded(false);
      runFaceMesh();
    } else {
      setLoaded(false);
      runHandpose();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [faceSelected]);

  const removeDraw = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const detect = async (net: HandPose) => {
    if (
      webcamRef.current?.video?.readyState === 4 &&
      canvasRef.current !== null
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);
      setLoaded(true);
      console.log(hand);

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawHand(hand, ctx);
      }else{
        console.log("ctx is null");
      }
      
    }
  };

  const runDetect = async (net: facemesh.FaceMesh) => {
    if (
      webcamRef.current?.video?.readyState === 4 &&
      canvasRef.current !== null
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      try {
        const face = await net.estimateFaces(video);
        setLoaded(true);
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        drawMesh(face, ctx);
      } catch (error) {
        console.error("Error estimating faces:", error);
      }
    }
  };

  
  const toggleFaceSelected = () => {
    setIsButtonDisabled(true);
    removeDraw();
    setLoaded(false); 
    setFaceSelected((prevFace) => !prevFace);
  
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 500);
  };

  return (
  <div className="w-screen overflow-x-hidden h-screen flex flex-col items-center
    bg-gradient-to-r from-pink-200 via-purple-400 to-indigo-600 
    p-4 space-y-6">
      <Camera webcamRef={webcamRef} canvasRef={canvasRef} loaded={loaded} />
      <div className="flex gap-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-xl">
        <button
          onClick={toggleFaceSelected}
          disabled={faceSelected || isButtonDisabled}
          className={`
            px-6 py-3 rounded-lg transition-all duration-300 ease-in-out
            text-white font-semibold tracking-wider uppercase
            ${faceSelected || isButtonDisabled 
              ? "bg-gray-400 cursor-not-allowed opacity-50" 
              : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"}
          `}
        >
          Face Detection
        </button>
        <button
          onClick={toggleFaceSelected}
          disabled={!faceSelected || isButtonDisabled}
          className={`
            px-6 py-3 rounded-lg transition-all duration-300 ease-in-out
            text-white font-semibold tracking-wider uppercase
            ${!faceSelected || isButtonDisabled 
              ? "bg-gray-400 cursor-not-allowed opacity-50" 
              : "bg-green-600 hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg"}
          `}
        >
          Hand Detection
        </button>
      </div>
  </div>
  );
}
