import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MedicationCard from "@/components/MedicationCard";
import BottomNav from "@/components/BottomNav";
import { mockMedications } from "@/lib/mockData";

export default function Schedule() {
  const [medications] = useState(mockMedications);
  const [activeTab, setActiveTab] = useState("today");

  // Mock medication status - todo: remove mock functionality
  const getMockStatus = (index: number) => {
    if (activeTab === "today") {
      return index < 2 ? "taken" : "pending";
    }
    return "pending";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 pb-4">
          <h1 className="text-[32px] font-bold" data-testid="text-page-title">
            Schedule
          </h1>
          <p className="text-[20px] text-muted-foreground mt-1">
            Your medication timeline
          </p>
        </div>

        {/* Day Selector */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-14 grid grid-cols-2 p-1" data-testid="tabs-day-selector">
              <TabsTrigger value="today" className="text-[20px] min-h-[48px]" data-testid="tab-today">
                Today
              </TabsTrigger>
              <TabsTrigger value="tomorrow" className="text-[20px] min-h-[48px]" data-testid="tab-tomorrow">
                Tomorrow
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-6 space-y-3">
              {medications.map((med, idx) => (
                <MedicationCard
                  key={med.id}
                  name={med.name}
                  dosage={med.dosage}
                  time={med.times[0]}
                  imageUrl={med.imageUrl}
                  status={getMockStatus(idx) as any}
                  onMarkTaken={() => console.log(`Mark ${med.name} as taken`)}
                />
              ))}
            </TabsContent>

            <TabsContent value="tomorrow" className="mt-6 space-y-3">
              {medications.map((med) => (
                <MedicationCard
                  key={med.id}
                  name={med.name}
                  dosage={med.dosage}
                  time={med.times[0]}
                  imageUrl={med.imageUrl}
                  status="pending"
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
