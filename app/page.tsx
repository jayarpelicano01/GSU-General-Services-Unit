import Hero from "./components/landing/Hero";
import Features from "./components/landing/Features";
import WorkflowDiagram from "./components/landing/WorkflowDiagram";
import Footer from "./components/landing/Footer";
import Header from "./components/landing/Header";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <WorkflowDiagram />
      <Footer />
    </>
  );
}