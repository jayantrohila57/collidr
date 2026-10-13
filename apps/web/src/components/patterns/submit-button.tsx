"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingLabel?: string;
}

export function SubmitButton({
  isLoading,
  loadingLabel = "Saving…",
  children,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      className={cn("min-w-28", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className="me-2" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
