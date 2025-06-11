"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useTranslation } from "@/app/i18n/client";

interface PreviewCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  imageImport?: { src: string } | string; // For direct image imports
  demoLink: string;
  features: string[];
  className?: string;
}

export function PreviewCard({
  title,
  description,
  icon: Icon,
  imageImport,
  demoLink,
  features,
  className = ""
}: PreviewCardProps) {
  const { userLocale } = useLanguage();
  const { t } = useTranslation(userLocale, 'preview-card');
  return (
    <Card className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div>
            <CardTitle className="text-xl transition-colors duration-300 group-hover:text-primary">{title}</CardTitle>
            <CardDescription className="mt-1 transition-opacity duration-300 group-hover:opacity-80">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview Image/Screenshot */}
        {imageImport ? (
          <div className="relative overflow-hidden rounded-lg border bg-muted group-hover:shadow-md transition-all duration-300">
            <img
              src={typeof imageImport === 'string' ? imageImport : imageImport.src}
              alt={`${t('previewOf')} ${title}`}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                // Hide the image and show placeholder
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.parentElement?.nextElementSibling;
                if (placeholder) placeholder.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : null}
        
        {/* Fallback placeholder (hidden by default if image exists) */}
        <div className={`h-48 bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg border border-dashed border-primary/30 flex items-center justify-center transition-all duration-300 ${imageImport ? 'hidden' : ''}`}>
          <div className="text-center">
            <Icon className="h-12 w-12 text-primary/60 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110" />
            <p className="text-sm text-muted-foreground">{t('previewComingSoon')}</p>
          </div>
        </div>

        {/* Features list */}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm transition-all duration-300 hover:translate-x-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
              <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button asChild className="w-full group-hover:bg-primary/90 transition-all duration-300 group-hover:shadow-lg">
          <Link href={demoLink} className="flex items-center justify-center gap-2">
            {t('viewDemo')}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 