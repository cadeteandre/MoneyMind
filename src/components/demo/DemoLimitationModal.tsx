"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SignInButton } from "@clerk/nextjs";
import { AlertCircle, CheckCircle, ArrowRight, Database, Shield } from "lucide-react";
import { useDemoModalContext } from "./DemoModalProvider";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/app/i18n/client";

interface DemoLimitationModalProps {
  className?: string;
}

export function DemoLimitationModal({ className }: DemoLimitationModalProps) {
  const { 
    isOpen, 
    limitationType,
    closeModal
  } = useDemoModalContext();

  const { userLocale } = useLanguage();
  const { t: tModal } = useTranslation(userLocale, 'demo-modal');

  const features = [
    {
      icon: CheckCircle,
      text: tModal('fullAccess')
    },
    {
      icon: Database,
      text: tModal('unlimitedTransactions')
    },
    {
      icon: ArrowRight,
      text: tModal('dataExport')
    },
    {
      icon: Shield,
      text: tModal('prioritySupport')
    }
  ];

  // Get specific content for limitation type
  const getSpecificContent = () => {
    const content = tModal(`${limitationType}.title`);
    const description = tModal(`${limitationType}.description`);
    return { title: content, description };
  };

  const specificContent = getSpecificContent();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent 
        className={cn(
          "max-w-md w-[95vw] max-h-[95vh] overflow-y-auto rounded-xl border-0 p-0 gap-0",
          "bg-gradient-to-br from-white via-gray-50/80 to-gray-100/60 dark:from-gray-900 dark:via-gray-950/80 dark:to-gray-800/60",
          "animate-in zoom-in-95 duration-300",
          className
        )}
      >
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">
          {specificContent.title}
        </DialogTitle>
        
        <div className="relative p-4 sm:p-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 animate-in slide-in-from-top duration-500">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 animate-pulse shadow-lg">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 transition-colors duration-300">
              {specificContent.title}
            </h2>
            
            <p className="text-xs sm:text-sm text-muted-foreground transition-colors duration-300">
              {specificContent.description}
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 animate-in slide-in-from-bottom duration-700">
            <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider transition-colors duration-300">
              {tModal('withFreeAccount')}
            </h3>
            
            <div className="grid gap-2 sm:gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:scale-[1.02] hover:shadow-md animate-in slide-in-from-left duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground transition-colors duration-300">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 sm:space-y-3 animate-in slide-in-from-bottom duration-500">
            <SignInButton>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground text-xs sm:text-sm py-2 sm:py-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                {tModal('signUpNow')}
              </Button>
            </SignInButton>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={closeModal}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 cursor-pointer transition-all duration-300 hover:bg-muted dark:hover:bg-gray-800 hover:scale-[1.02]"
            >
              {tModal('continueDemo')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 