import Analytics from "../components/Analytics";
import BrandIntro from "../components/BrandIntro";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import Hero from "../components/Hero";
import Highlights from "../components/Highlights";
import HowItWorks from "../components/HowItWorks";
import NetworkVisualization from "../components/NetworkVisualization";
import Opportunity from "../components/Opportunity";
import PlatformShowcase from "../components/PlatformShowcase";
import WhyProova from "../components/WhyProova";
import usePageTitle from "../lib/usePageTitle";

/**
 * Sections are ordered as one scroll story; each carries a `data-act` that drives the
 * page-level 3D stage (see three/acts.js).
 */
export default function Home() {
  usePageTitle("");

  return (
    <>
      <Hero />
      <Highlights />
      <BrandIntro />
      <PlatformShowcase />
      <HowItWorks />
      <WhyProova />
      <NetworkVisualization />
      <Analytics />
      <Opportunity />
      <FAQ />
      <FinalCTA />
    </>
  );
}
