
'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, MailCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mailPlans } from '@/lib/plans';

const planGuides: Record<string, { audience: string; highlights: string[] }> = {
  classic: {
    audience: 'Pour venir récupérer le courrier au centre.',
    highlights: ['Retrait sur place', 'Sans notification', 'Sans scan'],
  },
  starter: {
    audience: 'Pour recevoir une notification et consulter les scans.',
    highlights: ['Scan courrier', 'Notification email', 'Consultation en ligne'],
  },
  business: {
    audience: 'Le bon équilibre pour réduire les déplacements.',
    highlights: ['Scan courrier', 'Réexpédition mensuelle', 'Suivi postal'],
  },
  premium: {
    audience: 'Pour piloter le courrier à distance avec priorité.',
    highlights: ['Résumé IA', 'Alerte prioritaire', 'Réexpédition hebdomadaire'],
  },
};

export const MailStep = () => {
  const { control } = useFormContext();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-bold text-foreground">Choisissez selon votre usage réel du courrier.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Classic reste volontairement simple. Les offres supérieures activent le scan,
              les notifications, la réexpédition ou le résumé IA selon le niveau choisi.
            </p>
          </div>
        </div>
      </div>

      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        Tous les prix affiches sont hors taxes (HT).
      </p>

      <Controller
        control={control}
        name="mailPlanId"
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {mailPlans.map(plan => (
              <Label key={plan.id} htmlFor={`mailPlanId-${plan.id}`} className="w-full cursor-pointer">
                <RadioGroupItem
                  value={plan.id}
                  id={`mailPlanId-${plan.id}`}
                  className="sr-only"
                />
                <Card
                  className={cn(
                    'h-full flex flex-col overflow-hidden border transition-all duration-200',
                    field.value === plan.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'hover:border-primary/50',
                    plan.isRecommended && field.value !== plan.id && 'border-primary/50 bg-primary/5'
                  )}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-3">
                        <CardTitle>{plan.name}</CardTitle>
                        {plan.isRecommended && (
                        <Badge className="rounded-full">
                            Recommandé
                        </Badge>
                        )}
                    </div>
                    <CardDescription>
                      {plan.description}
                    </CardDescription>
                    <p className="text-2xl font-bold pt-2">
                      {plan.price}
                    </p>
                    <p className="rounded-2xl bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
                      {planGuides[plan.id]?.audience}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4 text-sm">
                    <div className="space-y-2">
                      {planGuides[plan.id]?.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center rounded-xl bg-primary/5 px-3 py-2 font-semibold text-foreground">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          {highlight}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 border-t pt-3">
                    {Object.entries(
                      plan.features
                    ).map(([feature, value]) => (
                      <div
                        key={feature}
                        className="flex items-center"
                      >
                        {value ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 mr-2 text-red-500" />
                        )}
                        <span
                          className={cn(
                            !value &&
                              'text-muted-foreground line-through'
                          )}
                        >
                          {feature}{' '}
                          {typeof value === 'string' &&
                            `(${value})`}
                        </span>
                      </div>
                    ))}
                    </div>
                  </CardContent>
                </Card>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
};
