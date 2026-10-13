import { Suspense } from "react";
import { SignOutScreen } from "@/components/sign-out-screen";

export default function SignOutPage() {
  return (
    <Suspense fallback={null}>
      <SignOutScreen />
    </Suspense>
  );
}
