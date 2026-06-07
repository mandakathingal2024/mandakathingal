import Events from "@/components/events/Events";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function EventsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <Events />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
