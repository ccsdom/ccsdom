
'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, RefreshCcw } from 'lucide-react';

interface ProjectOption {
  id: string;
  label: string;
  description: string;
  badge: string;
  icon: typeof Building2;
}

const projectOptions: ProjectOption[] = [
  {
    id: 'creation',
    label: 'Je crée mon entreprise',
    description: "Vous préparez une nouvelle société et vous avez besoin d'une adresse de siège social.",
    badge: 'Création',
    icon: Building2,
  },
  {
    id: 'transfert',
    label: 'Je transfère mon siège social',
    description: "Votre société existe déjà et vous souhaitez changer son adresse officielle.",
    badge: 'Transfert',
    icon: RefreshCcw,
  },
];

export const ProjectStep = () => {
  const { control } = useFormContext<{ projectType: string }>();

  return (
    <div className="space-y-4">
      <Controller
        name="projectType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={field.value}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
          >
            {projectOptions.map((option) => (
              <Label
                key={option.id}
                htmlFor={`project-type-${option.id}`}
                className="flex min-h-[180px] flex-col items-start justify-between rounded-3xl border bg-white/80 p-6
                  cursor-pointer transition-all text-center
                  has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 has-[input:checked]:shadow-md
                  hover:border-primary/50
                  focus-within:ring-2 focus-within:ring-primary focus-within:outline-none"
              >
                <RadioGroupItem
                  value={option.id}
                  id={`project-type-${option.id}`}
                  className="sr-only"
                />
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="rounded-full bg-white text-[10px] uppercase tracking-widest">
                    {option.badge}
                  </Badge>
                </div>
                <div className="mt-5 text-left">
                  <span className="text-base font-bold text-foreground">{option.label}</span>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
};
