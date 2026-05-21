import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Association from "@/components/home/Association";
import Photos from "@/components/home/Photos";
import Footer from "@/components/Footer"
import { Header } from "@/components/home/header"
import Editorial from "@/components/home/Editorial";
import AdvisoryBoard from "@/components/home/AdvisoryBoard";



export default function Home() {
  return (
    <>
        <header>
          <Header/>
        </header>
      {/* <Hero></Hero> */}
      <main id="main">
        <About/>
        <Editorial/>
        <AdvisoryBoard/>
        <Association/> 
        {/* //Association renamed as executives */}
        <Photos/>
      </main>
      <footer>
            <Footer/>
        </footer>
    </>
  );
}
