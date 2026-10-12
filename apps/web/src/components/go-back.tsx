"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const GoBackButton = memo(() => {
  const router = useRouter();

  const handleGoBack = useCallback(() => router.back(), [router]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={"icon"}
            onClick={handleGoBack}
            variant={"outline"}
            aria-label="Back"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleGoBack();
              }
            }}
          >
            <ChevronLeft
              aria-hidden="true"
              focusable="false"
              role="presentation"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p id="go-back-tooltip">{"Back"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

GoBackButton.displayName = "GoBackButton";

export default GoBackButton;
