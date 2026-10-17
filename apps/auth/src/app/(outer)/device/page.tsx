import type { Metadata } from "next";
import { Suspense } from "react";
import { DeviceCodeForm } from "@/components/device-code-form";

export const metadata: Metadata = { title: "Connect a device" };

export default function DevicePage() {
  return (
    <Suspense fallback={null}>
      <DeviceCodeForm />
    </Suspense>
  );
}
