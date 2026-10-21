import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "Audit complet", robots: { index: false } };

// Étape 4 du build : le paywall et le paiement Stripe arrivent ici.
export default function Offre() {
  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">
        L'audit complet ouvre très bientôt.
      </h1>
      <p className="mt-4 text-lg text-gris">
        Le paiement est en cours d'installation. Reviens dans quelques jours pour débloquer toute ta
        liste et toutes tes lettres.
      </p>
      <div className="mt-8">
        <Link href="/analyse" className="btn">Revenir à mon relevé</Link>
      </div>
    </main>
  );
}
