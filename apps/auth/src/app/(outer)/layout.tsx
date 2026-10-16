import { Auth5Frame } from "@loftlancer/ui/patterns/auth-5";

/** auth-5 split frame for sign-in/up/out, consent and device flows. */
export default function OuterLayout({ children }: { children: React.ReactNode }) {
  return <Auth5Frame>{children}</Auth5Frame>;
}
