import { cva, type VariantProps } from "class-variance-authority";
import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Shell = ({ children }: { children: React.ReactNode }) => {
  return children;
};

const HeaderVariants = cva("bg-background/20 backdrop-blur-xs", {
  variants: {
    variant: {
      default: "absolute top-0 z-50",
      sticky: "sticky top-0 z-50",
    },
    scale: {
      default: "w-full",
    },
    padding: {
      default: "",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    scale: "default",
    padding: "default",
  },
});
interface HeaderTypes {
  className?: string;
  children: ReactNode;
}

const Header = React.forwardRef<
  HTMLElement,
  HeaderTypes & VariantProps<typeof HeaderVariants>
>(({ className, variant, padding, scale, ...props }, ref) => {
  return (
    <header
      ref={ref}
      {...props}
      className={cn(
        HeaderVariants({ padding, scale, className, variant }),
        className,
      )}
    />
  );
});
Header.displayName = "Header";
Shell.Header = Header;

interface AsideTypes {
  className?: string;
  children: ReactNode;
}

const Aside = React.forwardRef<HTMLElement, AsideTypes>(
  ({ className, ...props }, ref) => {
    return <aside ref={ref} {...props} className={cn("", className)} />;
  },
);
Aside.displayName = "Aside";

Shell.Aside = Aside;

const FooterVariants = cva("backdrop-blur-xs", {
  variants: {
    variant: {
      default: "container mx-auto",
      absolute: "absolute bottom-0 z-50",
      sticky: "sticky bottom-0 z-50",
    },
    scale: {
      default: "h-full w-full",
    },
    padding: {
      default: "px-4 md:px-6",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    scale: "default",
    padding: "default",
  },
});

interface FooterTypes {
  className?: string;
  children: ReactNode;
}

const Footer = React.forwardRef<
  HTMLElement,
  FooterTypes & VariantProps<typeof FooterVariants>
>(({ className, variant, padding, scale, ...props }, ref) => {
  return (
    <footer
      ref={ref}
      {...props}
      className={cn(
        FooterVariants({ className, variant, padding, scale }),
        className,
      )}
    />
  );
});
Footer.displayName = "Footer";

Shell.Footer = Footer;

const MainVariants = cva("relative", {
  variants: {
    variant: {
      default: "flex flex-col",
      dashboard: "flex flex-1 flex-col gap-4 p-4 md:p-6",
      centered: "flex flex-col items-center justify-center py-16",
    },
    scale: {
      full: "h-full w-full",
      default: "h-full min-h-screen w-full",
      dashboard: "min-h-0 w-full flex-1",
    },
    padding: {
      default: "",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    scale: "default",
    padding: "default",
  },
});

interface MainTypes {
  className?: string;
  children: ReactNode;
}

const Main = React.forwardRef<
  HTMLDivElement,
  MainTypes & VariantProps<typeof MainVariants>
>(({ className, variant, scale, padding, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        MainVariants({ className, variant, scale, padding }),
        className,
      )}
      {...props}
    />
  );
});
Main.displayName = "Main";

Shell.Main = Main;

export default Shell;
