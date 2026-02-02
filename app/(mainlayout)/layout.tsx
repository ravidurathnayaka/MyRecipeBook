import Footer from "@/components/general/Footer";
import Navbar from "@/components/general/navbar/NavBar";
import { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Fixed navbar - spacer keeps content from sliding under it */}
      <div className="no-print">
        <Navbar />
        <div className="h-16" aria-hidden="true" />
      </div>

      {/* Main content grows to fill available space */}
      <main className="flex-1">{children}</main>

      {/* Footer always at the bottom - hidden when printing */}
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
