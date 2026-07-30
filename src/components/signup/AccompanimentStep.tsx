
'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  expertAccompanimentPlans,
  soloAccompanimentPlan,
} from '@/lib/plans';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export const AccompanimentStep = () => {
  const { control, watch } = useFormContext();
  const projectType = watch('projectType');
  
  const accompanimentPlans = [
    expertAccompanimentPlans[projectType === 'transfert' ? 'transfert' : 'creation'],
    soloAccompanimentPlan,
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Vous pouvez bénéficier d’un accompagnement expert pour sécuriser vos démarches administratives, ou gérer les démarches vous-même.
      </p>
      <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        Les prix affiches sont hors taxes (HT).
      </p>
      <Controller
        control={control}
        name="accompanimentType"
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {accompanimentPlans.map(plan => (
              <Label key={plan.id} htmlFor={`accompanimentType-${plan.id}`} className="w-full cursor-pointer h-full">
                <RadioGroupItem
                  value={plan.id}
                  id={`accompanimentType-${plan.id}`}
                  className="sr-only"
                />
                <Card
                  className={cn(
                    'h-full flex flex-col p-4 transition-all duration-200',
                    field.value === plan.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0 mt-1",
                        field.value === plan.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <plan.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold">
                        {plan.name}
                      </p>
                       <p className="text-lg font-bold pt-1 text-primary">
                          {plan.id.startsWith('expert_') ? `${plan.numericPrice}€ HT` : plan.price}
                        </p>
                    </div>
                  </div>
                  {plan.features.length > 0 && (
                    <CardContent className="flex-grow space-y-2 text-sm p-0 mt-4">
                      {plan.features.map(feature => (
                        <div
                          key={feature}
                          className="flex items-start"
                          dangerouslySetInnerHTML={{ __html: `<svg class="w-4 h-4 mr-2 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-muted-foreground">${feature}</span>`}}
                        />
                      ))}
                    </CardContent>
                  )}
                  {plan.id.startsWith('expert_') && (
                    <div className="pt-4 text-right mt-auto">
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                      >
                        <Link
                          href={plan.id === 'expert_creation' ? "/creation-entreprise" : "/transfert-entreprise"}
                          target="_blank"
                        >
                          En savoir plus{' '}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </Card>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
};
