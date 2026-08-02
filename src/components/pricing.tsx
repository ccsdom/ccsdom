
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mailPlans } from '@/lib/plans';
import { useState } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Headline } from './ui/headline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <section id="tarifs" className="relative bg-white py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl space-y-5 text-center">
          <div className="mx-auto inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
            Tarifs courrier
          </div>
          <Headline className="text-slate-950">
            Des offres lisibles pour chaque <strong>usage</strong>
          </Headline>
          <p className="mx-auto max-w-[740px] text-lg leading-8 text-slate-600">
            Du retrait simple sur place jusqu'au courrier digital augmenté par IA,
            choisissez le niveau de service qui correspond au quotidien de votre entreprise.
          </p>
          <p className="mx-auto inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Prix indiqués HT + TVA 20% (avec détails TTC)
          </p>

        </div>

        <div className="mb-14 flex items-center justify-center gap-6">
          <Label 
            htmlFor="payment-frequency" 
            className={cn(
              "cursor-pointer text-lg transition-colors duration-300",
              !isYearly ? 'text-primary font-bold' : 'text-muted-foreground'
            )}
            onClick={() => setIsYearly(false)}
          >
            Mensuel
          </Label>
          <Switch
            id="payment-frequency"
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
            aria-label="Changer la fréquence de paiement"
          />
          <div className="relative">
            <Label 
              htmlFor="payment-frequency" 
              className={cn(
              "cursor-pointer text-lg transition-colors duration-300",
                isYearly ? 'text-primary font-bold' : 'text-muted-foreground'
              )}
              onClick={() => setIsYearly(true)}
            >
              Annuel
            </Label>
            <div className="absolute -top-6 -right-12 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-tighter">
              -10% promo
            </div>
          </div>
        </div>

        <motion.div 
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {mailPlans.map((plan) => {
            const monthlyPrice = plan.numericPrice;
            const yearlyPrice = monthlyPrice * 12 * 0.9;
            const displayPrice = isYearly ? (yearlyPrice / 12).toFixed(2).replace('.', ',') : monthlyPrice.toFixed(2).replace('.', ',');
            const signupHref = `/signup?plan=${encodeURIComponent(plan.id)}&billing=${isYearly ? "yearly" : "monthly"}`;

            return (
              <motion.div key={plan.name} variants={cardVariants} className="h-full">
                <Card className={cn(
                  'group relative flex h-full flex-col border-slate-200 bg-slate-50/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-900/10', 
                  plan.isRecommended ? 'border-primary/40 bg-white ring-2 ring-primary ring-offset-4 ring-offset-white' : ''
                )}>
                  {plan.isRecommended && (
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                      Populaire
                    </div>
                  )}
                  
                  <CardHeader className="pt-8 text-center">
                    <CardTitle className="mb-2 text-2xl font-black tracking-tight text-slate-950">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[44px] text-slate-600">{plan.description}</CardDescription>
                    <div className="mt-6 flex flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isYearly ? 'yearly' : 'monthly'}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-5xl font-black tracking-tight text-slate-950">{displayPrice}€</span>
                          <span className="ml-1 font-medium text-slate-500">HT/mois</span>
                          <p className="mt-1.5 text-xs font-semibold text-slate-500">
                            soit {(monthlyPrice * (isYearly ? 0.9 : 1) * 1.20).toFixed(2).replace('.', ',')}€ TTC/mois (TVA 20%)
                          </p>
                        </motion.div>
                      </AnimatePresence>
                      {isYearly && (
                        <p className="mt-2 text-sm font-bold text-primary">
                          Facturé {yearlyPrice.toFixed(2).replace('.', ',')}€ HT/an ({ (yearlyPrice * 1.20).toFixed(2).replace('.', ',')}€ TTC/an)
                        </p>
                      )}
                    </div>

                  </CardHeader>

                  <CardContent className="flex-grow pt-4">
                    <ul className="space-y-4">
                      {Object.entries(plan.features).map(([feature, value]) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className={cn(
                            "mt-1 p-0.5 rounded-full shrink-0",
                            value ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </div>
                          <span className={cn(
                            "text-sm",
                            !value && "text-slate-400 line-through opacity-60"
                          )}>
                            {feature} {typeof value === 'string' && <span className="font-semibold">({value})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-8 pb-8">
                    <Button asChild className={cn(
                      "h-12 w-full rounded-full text-base font-semibold transition-all group-hover:scale-[1.02] active:scale-95",
                      plan.isRecommended ? "shadow-lg shadow-primary/20" : ""
                    )} variant={plan.isRecommended ? 'default' : 'outline'}>
                        <Link href={signupHref}>Choisir cette offre</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  );
}

    
