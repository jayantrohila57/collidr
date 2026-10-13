import { Button } from "@collidr/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@collidr/ui/card";
import Link from "next/link";
import { ConsentScreen } from "@/components/consent-screen";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { verifyOAuthConsentSearchParams } from "@/lib/oauth-consent-query";

type SearchParams = Record<string, string | string[] | undefined>;

function toUrlSearchParams(resolved: SearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
    }
  }
  return params;
}

function InvalidConsentRequest() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authorization request invalid</CardTitle>
          <CardDescription>
            This link is missing, expired, or was modified. Start again from the
            application that sent you here.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <Button render={<Link href="/sign-in" />}>Back to sign in</Button>
        </CardPanel>
      </Card>
    </div>
  );
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const params = toUrlSearchParams(resolved);
  const verified = await verifyOAuthConsentSearchParams(params);

  if (!verified) {
    return <InvalidConsentRequest />;
  }

  const clientId = verified.get("client_id");
  if (!clientId) {
    return <InvalidConsentRequest />;
  }

  const consentReturnTo = authAppReturnTo(`/consent?${verified.toString()}`);

  return (
    <ConsentScreen
      clientId={clientId}
      scope={verified.get("scope")}
      claimsJson={verified.get("claims")}
      consentReturnTo={consentReturnTo}
    />
  );
}
