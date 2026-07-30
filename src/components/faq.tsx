"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Headline } from "@/components/ui/headline";
import { publicFaqItems } from "@/lib/public-seo";
import { motion } from "framer-motion";

export default function Faq() {
  return (
    <section id="faq" className="relative overflow-hidden bg-slate-50 py-20 md:py-28">
      <div className="container relative px-4 md:px-6">
        <motion.div
          className="mx-auto mb-14 max-w-3xl space-y-5 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm">
            Questions fréquentes
          </div>
          <Headline className="text-slate-950">
            Les réponses avant de <strong>commencer</strong>
          </Headline>
          <p className="mx-auto max-w-[720px] text-lg leading-8 text-slate-600">
            Les points essentiels pour comprendre la domiciliation, les documents,
            le courrier digital et l'accompagnement.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 md:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {publicFaqItems.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={item.question} className="border-slate-200 last:border-0">
                <AccordionTrigger className="py-6 text-left text-lg font-black text-slate-950 transition-colors hover:text-primary md:text-xl">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-8 text-slate-600 md:text-lg">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
