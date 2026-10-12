"use client";

import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/domain/auth/lib/auth-actions";
import SectionHeading from "./section-heading";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for individual developers and small projects",
    price: "$0",
    period: "month",
    badge: "Free Forever",
    badgeVariant: "secondary" as const,
    features: [
      "Up to 3 projects",
      "Unlimited environment variables",
      "Basic encryption",
      "Community support",
      "GitHub integration",
    ],
    notIncluded: [
      "Team collaboration",
      "Advanced security features",
      "Priority support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    description: "Ideal for growing teams and professional projects",
    price: "$12",
    period: "user/month",
    badge: "Most Popular",
    badgeVariant: "default" as const,
    features: [
      "Unlimited projects",
      "Unlimited environment variables",
      "Advanced encryption",
      "Email support",
      "All integrations",
      "Team collaboration",
      "Role-based access control",
      "Audit logs",
    ],
    notIncluded: ["SSO integration", "Dedicated support"],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Complete solution for large organizations",
    price: "Custom",
    period: "",
    badge: "Advanced Features",
    badgeVariant: "outline" as const,
    features: [
      "Everything in Pro",
      "SSO integration",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom integrations",
      "On-premise deployment option",
      "Advanced compliance features",
      "Custom SLA",
    ],
    notIncluded: [],
    popular: false,
  },
];

export default function Pricing() {
  const { data: session, isPending } = useSession();

  return (
    <section id="pricing" className="py-24">
      <div>
        <SectionHeading
          badge="Pricing"
          title="Simple, Transparent"
          titleHighlight="Pricing for Everyone"
          description="Choose the perfect plan for your needs. Start free and scale as you grow."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={`plan-${plan.name.toLowerCase()}`}
              className={`relative overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                plan.popular ? "scale-105 ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="mr-1 h-3 w-3" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-6 text-center">
                <CardTitle className="font-bold text-2xl">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="font-bold text-4xl">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-2 text-muted-foreground">
                      /{plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={`${plan.name}-feature-${featureIndex}`}
                      className="flex items-start"
                    >
                      <Check className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}

                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div
                      key={`${plan.name}-not-included-${featureIndex}`}
                      className="flex items-start opacity-50"
                    >
                      <div className="mt-0.5 mr-2 h-4 w-4 shrink-0 rounded-sm border border-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`mt-6 w-full ${
                    plan.popular ? "bg-primary" : 'variant="outline"'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  asChild={!!session?.user}
                >
                  {isPending ? (
                    <div className="h-11 animate-pulse rounded bg-muted" />
                  ) : session?.user ? (
                    <Link href="/dashboard">
                      {plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      {plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <Card className="mx-auto border-muted">
            <CardContent className="p-8">
              <h3 className="mb-4 font-bold text-xl">
                Not sure which plan is right for you?
              </h3>
              <p className="mb-6 text-muted-foreground">
                Our team is here to help you choose the perfect plan for your
                needs.
              </p>
              <Button variant="outline" size="lg" className="gap-2">
                Schedule a Call
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
