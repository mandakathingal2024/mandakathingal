import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./assets/vendor/bootstrap/css/bootstrap.min.css"
import "./assets/vendor/bootstrap-icons/bootstrap-icons.css"
import "./assets/vendor/boxicons/css/boxicons.min.css"
import "./assets/vendor/glightbox/css/glightbox.min.css"
import "./assets/vendor/remixicon/remixicon.css"
import "./assets/vendor/swiper/swiper-bundle.min.css"
import "./assets/css/style.css"
import Script from "next/script";
import { StateContext } from "../../context/stateContext";




const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"], variable: '--font-playfair' });
export const metadata = {
  title: "Mandakathingal Family",
  description: "Mandakathingal Family Association",
  charset: "utf-8",
  manifest: "/manifest.json",
  themeColor: "#5C3D2E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mandakathingal Admin",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/m.png" type="image/png" />
        <link rel="apple-touch-icon" href="/m.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} ${playfair.variable}`}>
        <StateContext>
          {children}
        <Script src="/js/bootstrap/js/bootstrap.bundle.min.js"></Script>
        <Script src="/js/glightbox/js/glightbox.min.js"></Script>
        <Script src="/js/isotope-layout/isotope.pkgd.min.js"></Script>
        <Script src="/js/swiper/swiper-bundle.min.js"></Script>
        <Script src="/js/php-email-form/validate.js"></Script>
        <Script src="/js/main.js"/>
        </StateContext>
      </body>
    </html>
  );
}
