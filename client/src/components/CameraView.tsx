import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Zap, ZapOff } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CameraViewProps {
  onCapture?: (imageData: string) => void;
  onCancel?: () => void;
}

export default function CameraView({ onCapture, onCancel }: CameraViewProps) {
  const [flashOn, setFlashOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCapture = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/png");
        onCapture?.(imageData);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera viewfinder */}
      <div className="flex-1 relative">
        {/* Mock camera feed - in production would be actual video stream */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scan guide overlay */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-72 h-72 border-4 border-white/40 rounded-3xl relative">
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
            </div>
          </div>
        </div>

        {/* Top instruction */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <Card className="bg-black/60 backdrop-blur-sm border-white/20 p-4">
            <p className="text-white text-center text-[20px] font-semibold">
              Position pill in center frame
            </p>
          </Card>
        </div>

        {/* Flash toggle */}
        <Button
          size="icon"
          variant="outline"
          className="absolute top-6 right-6 w-14 h-14 bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          onClick={() => setFlashOn(!flashOn)}
          data-testid="button-flash-toggle"
        >
          {flashOn ? <Zap className="w-7 h-7" /> : <ZapOff className="w-7 h-7" />}
        </Button>

        {/* Cancel button */}
        <Button
          size="icon"
          variant="outline"
          className="absolute top-6 left-6 w-14 h-14 bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          <X className="w-7 h-7" />
        </Button>
      </div>

      {/* Capture button */}
      <div className="p-8 pb-12 flex justify-center">
        <Button
          size="icon"
          className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 active:scale-95 transition-transform"
          onClick={handleCapture}
          data-testid="button-capture"
        >
          <Camera className="w-10 h-10 text-black" />
        </Button>
      </div>
    </div>
  );
}
