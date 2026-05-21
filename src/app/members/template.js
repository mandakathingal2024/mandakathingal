import Footer from "@/components/Footer"
import { Header } from "@/components/home/header"


export default function Template({ children }) {
    return <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <header>
          <Header/>
        </header>
        <main style={{flex: 1}}>
          {children}
        </main>
        <footer>
            <Footer/>
        </footer>
    </div>
  }