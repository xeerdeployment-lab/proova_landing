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
// import WhyAxora from "../components/WhyAxora";
import usePageTitle from "../lib/usePageTitle";


export default function Home() {
  usePageTitle("");

  return (
    <>
      <Hero />
      <Highlights />
      <BrandIntro />
      <PlatformShowcase />
      <HowItWorks />
      {/* <WhyAxora /> */}
      <NetworkVisualization />
      <Analytics />
      <Opportunity />
      <FAQ />
      <FinalCTA />
    </>
  );
}
