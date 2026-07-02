import Executive from "@/components/executives/Executive";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";
import { getPublicCollection } from "@/lib/firestoreRest";

// Pre-render with ISR: fetch executives server-side and revalidate hourly.
export const revalidate = 3600;

export default async function ExecutivesPage() {
  const executives = await getPublicCollection("executives", { revalidate });
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <Executive initialExecutives={executives} />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
