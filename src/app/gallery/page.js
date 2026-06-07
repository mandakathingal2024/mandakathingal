import Gallery from "@/components/gallery/Gallery";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <Gallery />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
