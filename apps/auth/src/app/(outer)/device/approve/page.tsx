import { redirect } from "next/navigation";
import { DeviceApprovalScreen } from "@/components/device-approval-screen";
import { formatDeviceUserCode } from "@/lib/format-user-code";

export default async function DeviceApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ user_code?: string }>;
}) {
  const { user_code } = await searchParams;
  if (!user_code?.trim()) {
    redirect("/device");
  }

  const formatted = formatDeviceUserCode(user_code);
  if (!formatted) {
    redirect("/device");
  }

  return <DeviceApprovalScreen userCode={formatted} />;
}
