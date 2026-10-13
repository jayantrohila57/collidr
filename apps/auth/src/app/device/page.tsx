import { Suspense } from "react";
import { DeviceCodeForm } from "@/components/device-code-form";

export default function DevicePage() {
  return (
    <Suspense fallback={null}>
      <DeviceCodeForm />
    </Suspense>
  );
}
