import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ValidataAI | Enterprise Document Validation",
  description: "Sistem Ekstraksi & Validasi Dokumen (KTP, KK, Slip Gaji) otomatis menggunakan teknologi OCR dan AI Llama-3.",
  keywords: ["ValidataAI", "OCR Bank", "Verifikasi Dokumen", "AI Perbankan", "Llama-3", "Ekstraksi KTP"],
  authors: [{ name: "Revan Fatkhurezi" }],
  openGraph: {
    title: "ValidataAI | Validasi Kredit Super Cerdas",
    description: "Sistem otomasi ekstraksi OCR. Memvalidasi kelengkapan serta mencocokkan NIK, Nama, dan Nominal Gaji secara real-time.",
    url: "https://validata-ai.vercel.app",
    siteName: "ValidataAI",
    images: [
      {
        url: "/validata-ai-logo.png",
        width: 800,
        height: 800,
        alt: "ValidataAI Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValidataAI | Enterprise Document Validation",
    description: "Sistem Ekstraksi & Validasi Dokumen OCR Otomatis berbasis AI",
    images: ["/validata-ai-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
