"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

// Allow children and className on Portal
type DialogPortalProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Portal> & {
  children: React.ReactNode;
  className?: string;
};

const DialogPortal = ({ children, className, ...props }: DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    <div className={cn("fixed inset-0 z-50 flex items-start justify-center sm:items-center", className)}>
      {children}
    </div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
      className
    )}
    {...props}
    ref={forwardedRef}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, forwardedRef) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={forwardedRef}
      className={cn(
        "fixed z-50 grid w-full max-w-lg gap-4 scale-100 bg-popover p-6 opacity-100 animate-in fade-in-90 zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitive.Title
    ref={forwardedRef}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitive.Description
    ref={forwardedRef}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, forwardedRef) => (
  <DialogPrimitive.Close
    ref={forwardedRef}
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
));
DialogClose.displayName = DialogPrimitive.Close.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}; 