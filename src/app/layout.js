import { Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { StateContext } from "../../context/stateContext";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"], variable: '--font-playfair' });
export const metadata = {
  title: "Mandakathingal Family",
  description: "Mandakathingal Family Association",
  charset: "utf-8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/m.png" type="image/png" />
        <link rel="apple-touch-icon" href="/m.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Serif+Malayalam:wght@500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={playfair.variable}>
        <Script id="sw-cleanup" strategy="afterInteractive">{`
          if('serviceWorker' in navigator && !window.location.pathname.startsWith('/mkadminhamza')){
            navigator.serviceWorker.getRegistrations().then(function(registrations){
              registrations.forEach(function(r){r.unregister()})
            })
          }
        `}</Script>
        <StateContext>
          {children}
        </StateContext>
      </body>
    </html>
  );
}
