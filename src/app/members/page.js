import Members from "@/components/members/Members";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";

export default function MembersPage() {
  return (
    <>
      <Header />
      <main id="main">
        <Members />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
