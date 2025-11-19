import { useState } from "react";
import CameraView from "@/components/CameraView";
import PillIdentification from "@/components/PillIdentification";
import { pillDatabase } from "@/lib/mockData";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Scan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(true);
  const [identifiedPill, setIdentifiedPill] = useState<any>(null);

  const handleCapture = (imageData: string) => {
    console.log("Captured image:", imageData.substring(0, 50));
    
    // Mock pill identification - todo: remove mock functionality
    // Randomly select a pill from database with confidence
    const randomPill = pillDatabase[Math.floor(Math.random() * pillDatabase.length)];
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
    
    setIdentifiedPill({
      ...randomPill,
      confidence,
    });
    setIsScanning(false);
  };

  const handleConfirm = () => {
    toast({
      title: "Dose Logged",
      description: `${identifiedPill.name} has been recorded`,
    });
    setLocation("/");
  };

  const handleRetry = () => {
    setIdentifiedPill(null);
    setIsScanning(true);
  };

  if (isScanning) {
    return (
      <CameraView
        onCapture={handleCapture}
        onCancel={() => setLocation("/")}
      />
    );
  }

  if (identifiedPill) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <PillIdentification
          pillName={identifiedPill.name}
          pillImage={identifiedPill.image}
          confidence={identifiedPill.confidence}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return null;
}
