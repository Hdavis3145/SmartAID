import CameraView from "../CameraView";

export default function CameraViewExample() {
  return (
    <CameraView
      onCapture={(imageData) => console.log("Captured:", imageData.substring(0, 50))}
      onCancel={() => console.log("Cancelled")}
    />
  );
}
