import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Sazón";

export const metadata: Metadata = {
  title: {
    default: `${appName} · Recetario`,
    template: `%s · ${appName}`,
  },
  description:
    "Explora recetas del mundo por categoría, búscalas por nombre y guarda tus favoritas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Navbar appName={appName} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
