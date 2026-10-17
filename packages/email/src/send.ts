import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: "not-configured" }
  | { status: "failed"; error: string };

const DEFAULT_FROM = "Loftlancer <noreply@loftlancer.com>";

let client: Resend | null = null;

/** Email is off until RESEND_API_KEY exists; callers never need to check. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getClient(): Resend {
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { status: "skipped", reason: "not-configured" };
  }
  try {
    const html = await render(input.react);
    const text = await render(input.react, { plainText: true });
    const { data, error } = await getClient().emails.send(
      {
        from: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
        to: input.to,
        subject: input.subject,
        html,
        text,
        tags: input.tags,
      },
      input.idempotencyKey
        ? { idempotencyKey: input.idempotencyKey }
        : undefined,
    );
    if (error || !data) {
      const message = error?.message ?? "unknown error";
      console.error("[email] send failed", message);
      return { status: "failed", error: message };
    }
    return { status: "sent", id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] send threw", message);
    return { status: "failed", error: message };
  }
}
