"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInButton } from "@clerk/nextjs";
import { AlertCircle, Sparkles, Shield, Smartphone, Database } from "lucide-react";
import { useDemoModalContext } from "@/components/demo/DemoModalProvider";
import { cn } from "@/lib/utils";

interface DemoLimitationModalProps {
  className?: string;
}

export function DemoLimitationModal({ className }: DemoLimitationModalProps) {
  const { 
    isOpen, 
    closeModal, 
    getLimitationMessage, 
    translations: t 
  } = useDemoModalContext();



  const features = [
    {
      icon: Database,
      text: t('features.realData'),
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Sparkles,
      text: t('features.fullAccess'),
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Smartphone,
      text: t('features.dataSync'),
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      text: t('features.security'),
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent 
        className={cn(
          "w-[95vw] max-w-lg max-h-[95vh] p-0 gap-0 bg-gradient-to-br from-background to-muted/30 border-2 overflow-hidden",
          className
        )}
      >
        {/* Header with gradient background */}
        <DialogHeader className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-4 sm:px-6 py-4 text-center flex-shrink-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              {t('title')}
            </DialogTitle>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(95vh-200px)]">
          {/* Limitation message */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 p-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {getLimitationMessage()}
                  </p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {t('description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
              WITH A FREE ACCOUNT
            </h3>
            <div className="grid gap-2 sm:gap-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 rounded-lg bg-muted/50 p-2 sm:p-3 transition-colors hover:bg-muted/70"
                >
                  <div className={cn(
                    "flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white flex-shrink-0",
                    feature.gradient
                  )}>
                    <feature.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <SignInButton>
              <Button 
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm py-2 sm:py-3 cursor-pointer"
              >
                <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {t('actions.createAccount')}
              </Button>
            </SignInButton>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={closeModal}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 cursor-pointer"
            >
              {t('actions.continueBrowsing')}
            </Button>
          </div>

          {/* Demo Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              🎯 Demo Mode Active
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 