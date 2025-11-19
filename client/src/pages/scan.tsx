import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CameraView from "@/components/CameraView";
import PillIdentification from "@/components/PillIdentification";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Medication } from "@shared/schema";

interface IdentifiedPill {
  pillName: string;
  pillType: string;
  pillImage: string;
  confidence: number;
  commonFor: string;
}

export default function Scan() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(true);
  const [identifiedPill, setIdentifiedPill] = useState<IdentifiedPill | null>(null);

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const identifyMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("/api/identify-pill", {
        method: "POST",
        body: JSON.stringify({ imageData }),
      });
      return response.json();
    },
    onSuccess: (data: IdentifiedPill) => {
      setIdentifiedPill(data);
      setIsScanning(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to identify pill. Please try again.",
        variant: "destructive",
      });
      setIsScanning(true);
    },
  });

  const logMutation = useMutation({
    mutationFn: async (pillData: IdentifiedPill) => {
      // Find matching medication in schedule
      const matchingMed = medications.find(m => m.name === pillData.pillName);
      
      if (!matchingMed) {
        throw new Error("Medication not found in schedule");
      }

      // Find the next scheduled time for this medication
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      let closestTime = matchingMed.times[0];
      let smallestDiff = Infinity;

      matchingMed.times.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        const scheduleTimeInMinutes = hour * 60 + minute;
        const diff = Math.abs(scheduleTimeInMinutes - currentTimeInMinutes);
        
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestTime = time;
        }
      });

      const logData = {
        medicationId: matchingMed.id,
        medicationName: matchingMed.name,
        scheduledTime: closestTime,
        takenTime: new Date(),
        status: "taken",
        confidence: pillData.confidence,
        scannedPillType: pillData.pillType,
      };

      const response = await apiRequest("/api/logs", {
        method: "POST",
        body: JSON.stringify(logData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Dose Logged",
        description: `${identifiedPill?.pillName} has been recorded`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log medication",
        variant: "destructive",
      });
    },
  });

  const handleCapture = (imageData: string) => {
    identifyMutation.mutate(imageData);
  };

  const handleConfirm = () => {
    if (identifiedPill) {
      logMutation.mutate(identifiedPill);
    }
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
    // Check if this pill matches any scheduled medication
    const matchingMed = medications.find(m => m.name === identifiedPill.pillName);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <PillIdentification
          pillName={identifiedPill.pillName}
          pillImage={identifiedPill.pillImage}
          confidence={identifiedPill.confidence}
          expectedPill={matchingMed?.name}
          onConfirm={matchingMed ? handleConfirm : undefined}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return null;
}
