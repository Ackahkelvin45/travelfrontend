import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import StoreProvider from "../components/providers/StoreProvider";
import PendingBookingBanner from "../components/booking/PendingBookingBanner";
import ThemeInitializer from "../components/providers/ThemeInitializer";

export const metadata: Metadata = {
 title: "Azura Travels - Curated Luxury Travel Experiences",
 description: "Discover unparalleled luxury travel experiences with Azura Travels.",
 icons: {
 icon: "icon.png",

 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className="h-full antialiased" suppressHydrationWarning>
 <head>
 <script
 dangerouslySetInnerHTML={{
 __html: `
 (function() {
 try {
 var theme = localStorage.getItem('theme');
 if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
 document.documentElement.classList.add('dark');
 }
 } catch(e) {}
 })();
 `,
 }}
 />
 <link rel="preconnect" href="https://fonts.googleapis.com" />
 <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
 <link
 href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Mulish:ital,wght@0,200..1000;1,200..1000&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Raleway:ital,wght@0,100..900;1,100..900&family=Syne:wght@400..800&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
 rel="stylesheet"
 />
 </head>
 <body suppressHydrationWarning className="min-h-full flex flex-col bg-background">
 <StoreProvider>
 <ThemeInitializer />
 <Navbar />
 {children}
 <PendingBookingBanner />
 <Footer />
 </StoreProvider>
 </body>
 </html>
 );
}
