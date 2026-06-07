import Gallery from "@/components/gallery/Gallery";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";
import Script from "next/script";

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <Gallery />
      </main>
      <Footer />
      <ScrollReveal />
      <link rel="stylesheet" href="/vendor/glightbox/css/glightbox.min.css" />
      <Script src="/vendor/glightbox/js/glightbox.min.js" strategy="afterInteractive" />
      <Script id="glightbox-init" strategy="afterInteractive">{`
        document.addEventListener('DOMContentLoaded', function() {
          if (typeof GLightbox !== 'undefined') GLightbox({ selector: '.glightbox' });
        });
        if (typeof GLightbox !== 'undefined') GLightbox({ selector: '.glightbox' });
      `}</Script>
    </>
  );
}
