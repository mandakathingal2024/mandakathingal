import StoryIntro from "@/components/our-story/StoryIntro";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function OurStoryPage() {
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <StoryIntro />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
