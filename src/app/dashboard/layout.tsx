"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Footer } from "@/components/footer";
import { BottomNavbar } from "@/components/bottom-navbar";
import { SimulationBanner } from "@/components/simulation-banner";
import { SuspensionGuard } from "@/components/suspension-guard";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col mesh-premium overflow-hidden">
      {/* Background Pulse Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"
        />
      </div>

      <SimulationBanner />
      <DashboardSidebar />
      
      <div className="relative z-10 flex flex-col sm:gap-4 sm:pl-14 lg:pl-64 transition-all duration-500">
        <DashboardHeader />
        <main className="flex-1 gap-6 p-4 sm:px-8 sm:py-6 md:gap-10 pb-20 sm:pb-8">
          <SuspensionGuard>
            <div className="animate-fade-in h-full">
              {children}
            </div>
          </SuspensionGuard>
        </main>
        <Footer />
      </div>
      <BottomNavbar />
    </div>
  );
}
