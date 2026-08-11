import { Playfair_Display, Cormorant_Garamond, Hanken_Grotesk, Noto_Serif_Malayalam, Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { StateContext } from "../../context/stateContext";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"], variable: '--font-playfair', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: '--font-cormorant', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: '--font-hanken', display: 'swap' });
const notoSerifMal = Noto_Serif_Malayalam({ subsets: ["malayalam"], weight: ["500", "600", "700"], variable: '--font-noto-serif-mal', display: 'swap' });
const notoSansMal = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: ["400", "500", "600"], variable: '--font-noto-sans-mal', display: 'swap' });
export const metadata = {
  title: "Mandakathingal Family",
  description: "Mandakathingal Family Association",
  charset: "utf-8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${hanken.variable} ${notoSerifMal.variable} ${notoSansMal.variable}`}>
      <head>
        <link rel="icon" href="/m.png" type="image/png" />
        <link rel="apple-touch-icon" href="/m.png" />
      </head>
      <body>
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
        <SpeedInsights />
      </body>
    </html>
  );
}
