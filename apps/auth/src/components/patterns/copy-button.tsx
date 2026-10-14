"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/components/patterns/icon-button";
import { getClientErrorMessage } from "@/lib/errors/client-errors";
import { toast } from "@/lib/toast";

interface CopyButtonProps {
  value: string;
  label?: string;
  disabled?: boolean;
}

export function CopyButton({
  value,
  label = "Copy to clipboard",
  disabled,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to copy"));
    }
  };

  return (
    <IconButton
      icon={copied ? Check : Copy}
      label={label}
      onClick={handleCopy}
      disabled={disabled || !value}
    />
  );
}
