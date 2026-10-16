import { Auth5Content, Auth5Frame } from "@loftlancer/ui/patterns/auth-5";

/** Onboarding sits outside the dashboard shell in the auth-5 split layout. */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Auth5Frame>
      <Auth5Content>{children}</Auth5Content>
    </Auth5Frame>
  );
}
