import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Leadership from "@/components/home/Leadership";
import RecentActivities from "@/components/home/RecentActivities";
import Milestones from "@/components/home/Milestones";
import Footer from "@/components/Footer";
import { Header } from "@/components/home/header";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <main id="main">
        <About />
        <Leadership />
        <RecentActivities />
        <Milestones />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
