import Script from "next/script";
import { Suspense } from "react";
import "@/app/globals.css";
import Analytics from "@/components/Analytics";
import FavoritesProvider from "@/components/FavoritesProvider";
import Header from "@/components/Header";
import { site } from "@/lib/config";
import { getCategories } from "@/lib/wp";

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s - ${site.title}`,
  },
  description: site.longDescription,
  keywords: ["javascript", "react", "music", "software", "science"],
};

export default async function RootLayout({ children }) {
  const categories = await getCategories();

  return (
    <html lang="en" data-theme="ocean" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("curiosphere:color-scheme:v1");if(["ocean","midnight","forest","sunset"].includes(t))document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body>
        <FavoritesProvider>
          <Header categories={categories} />
          <main>{children}</main>
        </FavoritesProvider>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.GoogleAnalyticsObject="ga";window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;ga("create","UA-138142992-3","auto");ga("send","pageview");`}
        </Script>
        <Script
          src="https://www.google-analytics.com/analytics.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
