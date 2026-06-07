import { ViewFamily } from "@/components/members/ViewFamily";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function MemberDetailPage({ params }) {
  return (
    <>
      <Header />
      <main id="main">
        <ViewFamily id={params.id} />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
