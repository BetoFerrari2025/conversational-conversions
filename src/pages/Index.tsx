import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Steps from "@/components/landing/Steps";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
import Stats from "@/components/landing/Stats";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <Hero />
    <Steps />
    <Features />
    <Testimonials />
    <Stats />
    <Pricing />
    <CTA />
    <Footer />
  </div>
);

export default Index;
