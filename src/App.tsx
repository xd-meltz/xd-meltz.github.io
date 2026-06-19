import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ChalkboardMenu from "./components/ChalkboardMenu";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";

export default function App() {
  // Smooth Scrolling
  const scrollToSection = (id: string) => {
    if (id === "root") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 80; // 80px (h-20) sticky header height adjustment
        window.scrollTo({
          top: targetY,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-amber-200 selection:text-espresso-950">
      
      {/* Navigation Header */}
      <Navbar onScrollTo={scrollToSection} />

      {/* Main Sections Stack */}
      <main className="flex-1">
        
        {/* Banner Hero */}
        <Hero 
          onExploreMenu={() => scrollToSection("section-menu")} 
        />

        {/* Full Chalkboard Menu Component */}
        <ChalkboardMenu />

        {/* About Community Hub Section */}
        <AboutSection />

      </main>

      {/* Footer Contact area */}
      <Footer />

    </div>
  );
}
