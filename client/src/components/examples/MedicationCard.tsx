import MedicationCard from "../MedicationCard";
import whiteTabletImg from "@assets/generated_images/White_round_tablet_pill_531071e0.png";

export default function MedicationCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <MedicationCard
        name="Lisinopril"
        dosage="10mg"
        time="08:00 AM"
        imageUrl={whiteTabletImg}
        status="taken"
      />
      <MedicationCard
        name="Metformin"
        dosage="500mg"
        time="09:00 AM"
        imageUrl={whiteTabletImg}
        status="pending"
        onMarkTaken={() => console.log("Mark as taken clicked")}
      />
      <MedicationCard
        name="Atorvastatin"
        dosage="20mg"
        time="08:00 PM"
        imageUrl={whiteTabletImg}
        status="missed"
      />
    </div>
  );
}
