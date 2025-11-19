import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Zap, ZapOff, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CameraViewProps {
  onCapture?: (imageData: string) => void;
  onCancel?: () => void;
}

export default function CameraView({ onCapture, onCancel }: CameraViewProps) {
  const [flashOn, setFlashOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Request camera access when component mounts
    const startCamera = async () => {
      try {
        // Check if browser supports camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Your browser doesn't support camera access. Please use a modern browser.");
          return;
        }

        // Request rear camera for mobile devices, any camera for desktop
        const constraints = {
          video: {
            facingMode: { ideal: "environment" }, // Prefer rear camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error("Camera access error:", error);
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            setCameraError("Camera permission denied. Please allow camera access.");
          } else if (error.name === "NotFoundError") {
            setCameraError("No camera found on this device.");
          } else {
            setCameraError("Failed to access camera. Please try again.");
          }
        }
      }
    };

    startCamera();

    // Cleanup: stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (canvasRef.current && videoRef.current && isCameraReady) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.9);
        onCapture?.(imageData);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {/* Real camera feed */}
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Error state */}
        {cameraError && (
          <div className="absolute inset-0 bg-black flex items-center justify-center p-6">
            <Card className="bg-red-950/90 border-red-500 p-6 max-w-md">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-400" />
                <p className="text-white text-[22px] font-semibold">{cameraError}</p>
                <Button
                  variant="outline"
                  className="min-h-[56px] text-[20px] border-white/20 text-white hover:bg-white/20"
                  onClick={onCancel}
                  data-testid="button-error-close"
                >
                  Go Back
                </Button>
              </div>
            </Card>
          </div>
        )}
        
        {/* Loading state */}
        {!isCameraReady && !cameraError && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-white text-[22px] font-semibold animate-pulse">
              Starting camera...
            </div>
          </div>
        )}
        
        {/* Scan guide overlay (only show when camera is ready) */}
        {isCameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 border-4 border-white/40 rounded-3xl relative">
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
            </div>
          </div>
        )}

        {/* Top instruction */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <Card className="bg-black/60 backdrop-blur-sm border-white/20 p-4">
            <p className="text-white text-center text-[20px] font-semibold">
              Position pill in center frame
            </p>
          </Card>
        </div>

        {/* Flash toggle - note: browser flash/torch API is limited, this is UI-only */}
        {isCameraReady && !cameraError && (
          <Button
            size="icon"
            variant="outline"
            className="absolute top-6 right-6 w-14 h-14 bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            onClick={() => setFlashOn(!flashOn)}
            data-testid="button-flash-toggle"
          >
            {flashOn ? <Zap className="w-7 h-7" /> : <ZapOff className="w-7 h-7" />}
          </Button>
        )}

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
          className="w-20 h-20 rounded-full bg-white hover:bg-gray-200 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCapture}
          disabled={!isCameraReady || !!cameraError}
          data-testid="button-capture"
        >
          <Camera className="w-10 h-10 text-black" />
        </Button>
      </div>
    </div>
  );
}
