export const metadata = {
  manifest: "/admin-manifest.json",
  themeColor: "#5C3D2E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mandakathingal Admin",
  },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      {children}
    </>
  );
}
