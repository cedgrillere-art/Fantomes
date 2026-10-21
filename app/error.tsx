"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">
        Quelque chose s'est mal passé.
      </h1>
      <p className="mt-4 text-lg text-gris">
        Ce n'est pas de ta faute. Réessaie dans un instant ; si le problème
        continue, repars de l'accueil.
      </p>
      <div className="mt-8 space-y-3">
        <button type="button" onClick={reset} className="btn">
          Réessayer
        </button>
        <Link
          href="/"
          className="flex min-h-12 items-center justify-center text-gris underline underline-offset-4"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
