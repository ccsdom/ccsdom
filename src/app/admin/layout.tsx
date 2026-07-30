
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Footer } from "@/components/footer";
import { AdminBottomNavbar } from "@/components/admin-bottom-navbar";
import { CenterSuspensionGuard } from "@/components/center-suspension-guard";
import { SimulationBanner } from "@/components/simulation-banner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col mesh-premium">
      <SimulationBanner />
      <DashboardSidebar />
      <div className="flex flex-col sm:gap-4 sm:pl-14 lg:pl-64 transition-all duration-500">
        <DashboardHeader />
        <main className="flex-1 gap-6 p-4 sm:px-8 sm:py-6 md:gap-10 pb-24 sm:pb-8">
          <div className="animate-fade-in">
            <CenterSuspensionGuard>{children}</CenterSuspensionGuard>
          </div>
        </main>
        <Footer />
      </div>
      <AdminBottomNavbar />
    </div>
  );
}
