import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Flare by TK — Fast Casual Restaurant in Bahawalpur",
  description:
    "Flare by TK serves flame-grilled burgers, pizzas, BBQ, paratha rolls and desi specials in Satellite Town, Bahawalpur. Order online for delivery or pickup.",
  openGraph: {
    title: "Flare by TK",
    description:
      "Flame-grilled burgers, pizzas, BBQ and desi specials in Bahawalpur. Order online for delivery or pickup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-100 antialiased">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
