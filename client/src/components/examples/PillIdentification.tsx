import PillIdentification from "../PillIdentification";
import whiteTabletImg from "@assets/generated_images/White_round_tablet_pill_531071e0.png";

export default function PillIdentificationExample() {
  return (
    <div className="p-6 space-y-6">
      <PillIdentification
        pillName="Lisinopril"
        pillImage={whiteTabletImg}
        confidence={95}
        expectedPill="Lisinopril"
        onConfirm={() => console.log("Confirmed")}
        onRetry={() => console.log("Retry")}
      />
    </div>
  );
}
