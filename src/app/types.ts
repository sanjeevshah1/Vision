import Webcam from "react-webcam";
export type CameraProps = {
    webcamRef: React.RefObject<Webcam | null>;
    canvasRef: React.RefObject<HTMLCanvasElement|null>;
    loaded: boolean;
  };