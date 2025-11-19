import HistoryEntry from "../HistoryEntry";
import whiteTabletImg from "@assets/generated_images/White_round_tablet_pill_531071e0.png";

export default function HistoryEntryExample() {
  return (
    <div className="p-6 space-y-3 max-w-2xl">
      <HistoryEntry
        medicationName="Lisinopril"
        dosage="10mg"
        scheduledTime="08:00 AM"
        takenTime="08:05 AM"
        status="taken"
        imageUrl={whiteTabletImg}
      />
      <HistoryEntry
        medicationName="Metformin"
        dosage="500mg"
        scheduledTime="09:00 AM"
        status="missed"
        imageUrl={whiteTabletImg}
      />
    </div>
  );
}
