import Events from "@/components/events/Events";
import { Header } from "@/components/home/header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/home/ScrollReveal";
import { getPublicCollection } from "@/lib/firestoreRest";

// Pre-render with ISR: fetch events server-side and revalidate hourly.
export const revalidate = 3600;

export default async function EventsPage() {
  const events = await getPublicCollection("events", { revalidate });
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <Events initialEvents={events} />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
