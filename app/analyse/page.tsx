import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Analyse du relevé",
  robots: { index: false },
};

// Étape 3 du build : le dépôt du relevé arrive ici.
export default function Analyse() {
  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">
        L'analyse du relevé arrive très bientôt.
      </h1>
      <p className="mt-4 text-lg text-gris">
        Cette étape est en cours de construction. Reviens dans quelques jours :
        tu pourras déposer ton relevé et voir tes vrais fantômes.
      </p>
      <div className="mt-8">
        <Link href="/" className="btn">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
