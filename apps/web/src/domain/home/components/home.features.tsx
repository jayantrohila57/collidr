"use client";

import {
  ArrowRight,
  Check,
  Cloud,
  GitBranch,
  Lock,
  Shield,
  Terminal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { FramePanel } from "@/components/ui/frame";
import { GitHubLoginButton } from "@/domain/auth/components/github-login";
import { useSession } from "@/domain/auth/lib/auth-actions";
import SectionHeading from "./section-heading";

const features = [
  {
    icon: Lock,
    title: "Secure Storage",
    description:
      "Bank-level encryption ensures your environment variables and secrets are protected with industry-standard security measures.",
    badge: "Security",
    details: [
      "AES-256 encryption",
      "Zero-knowledge architecture",
      "SOC 2 compliant",
    ],
  },
  {
    icon: GitBranch,
    title: "Version Control Integration",
    description:
      "Seamlessly integrate with your existing Git workflows and CI/CD pipelines for automated environment management.",
    badge: "Integration",
    details: ["GitHub Actions", "GitLab CI", "Jenkins", "Azure DevOps"],
  },
  {
    icon: Cloud,
    title: "Multi-Environment Support",
    description:
      "Manage different configurations for development, staging, and production environments from a single dashboard.",
    badge: "Flexibility",
    details: ["Dev/Staging/Prod", "Feature branches", "Preview environments"],
  },
  {
    icon: Terminal,
    title: "Developer Tools",
    description:
      "Powerful CLI and SDK integrations that fit naturally into your existing development workflow.",
    badge: "Developer Experience",
    details: ["CLI tools", "SDKs for major languages", "IDE extensions"],
  },
  {
    icon: Shield,
    title: "Access Control",
    description:
      "Granular permissions and role-based access control ensure team members only see what they need.",
    badge: "Enterprise",
    details: ["Role-based access", "SSO integration", "Audit logs"],
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share environment configurations safely with your team while maintaining security and compliance.",
    badge: "Collaboration",
    details: ["Team workspaces", "Shared secrets", "Approval workflows"],
  },
];

export default function Features() {
  const { data: session, isPending } = useSession();

  return (
    <>
      <SectionHeading
        badge="Features"
        title="Everything You Need for"
        titleHighlight="Environment Management"
        description="Built by developers, for developers. Our platform provides all the tools you need to manage environment variables securely and efficiently."
      />
      <FramePanel id="features">
        {features.map((feature) => (
          <Card key={`feature-${feature.title.toLowerCase()}`}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardPanel>
              <div className="flex items-center justify-between">
                <feature.icon className="size-6 text-primary" aria-hidden />
                <Badge variant="secondary">{feature.badge}</Badge>
              </div>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li
                    key={`${feature.title}-detail-${detailIndex}`}
                    className="flex items-center text-muted-foreground text-sm"
                  >
                    <Check className="me-2 mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardPanel>
          </Card>
        ))}
      </FramePanel>
      <FramePanel>
        <Card>
          <CardHeader>
            <CardTitle>
              Ready to streamline your environment management?
            </CardTitle>
            <CardDescription>
              Join thousands of developers who trust env-manager for their
              environment variable security and management needs.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            {isPending ? (
              <div className="h-11 w-32 animate-pulse rounded-lg bg-muted" />
            ) : session?.user ? (
              <Button
                size="lg"
                className="gap-2"
                render={<Link href="/dashboard" />}
              >
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <GitHubLoginButton size="default" />
            )}
          </CardPanel>
        </Card>
      </FramePanel>
    </>
  );
}
