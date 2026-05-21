import Footer from "@/components/Footer"
import { Header } from "@/components/home/header"


export default function Template({ children }) {
    // console.log(key)
    return <>
        <header>
          <Header/>
        </header>
        <main>
          {children}
        </main>
        <footer>
            <Footer/>
        </footer>
    </>
  }