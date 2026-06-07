import Executive from "@/components/executives/Executive";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function ExecutivesPage() {
  return (
    <>
      <Header />
      <main id="main">
        <Executive />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
