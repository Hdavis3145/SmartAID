import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import MedicationCard from "@/components/MedicationCard";
import BottomNav from "@/components/BottomNav";
import { mockMedications } from "@/lib/mockData";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [medications] = useState(mockMedications);
  
  // Mock stats - todo: remove mock functionality
  const todayMeds = medications.filter(m => m.times.includes("08:00") || m.times.includes("09:00"));
  const takenCount = 2;
  const totalCount = todayMeds.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-[32px] font-bold" data-testid="text-page-title">
              SmartAid
            </h1>
            <p className="text-[20px] text-muted-foreground mt-1">
              Medication Tracker
            </p>
          </div>

          {/* Primary Action */}
          <Button
            onClick={() => setLocation("/scan")}
            className="w-full min-h-[80px] text-[24px] gap-3"
            data-testid="button-scan-pill"
          >
            <Camera className="w-8 h-8" />
            Scan Pill Now
          </Button>

          {/* Stats */}
          <div className="space-y-3">
            <h2 className="text-[24px] font-semibold">Today's Progress</h2>
            <StatCard
              label="Medications Taken"
              value={`${takenCount} of ${totalCount}`}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              label="Pending Doses"
              value={totalCount - takenCount}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              label="Weekly Adherence"
              value="95%"
              icon={TrendingUp}
              variant="success"
            />
          </div>

          {/* Upcoming Medications */}
          <div className="space-y-4">
            <h2 className="text-[24px] font-semibold">Upcoming Today</h2>
            <div className="space-y-3">
              {todayMeds.slice(0, 3).map((med, idx) => (
                <MedicationCard
                  key={med.id}
                  name={med.name}
                  dosage={med.dosage}
                  time={med.times[0]}
                  imageUrl={med.imageUrl}
                  status={idx < takenCount ? "taken" : "pending"}
                  onMarkTaken={() => console.log(`Mark ${med.name} as taken`)}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              className="w-full min-h-[56px] text-[22px]"
              onClick={() => setLocation("/schedule")}
              data-testid="button-view-full-schedule"
            >
              View Full Schedule
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
