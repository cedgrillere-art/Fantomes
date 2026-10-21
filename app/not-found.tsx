import Link from "next/link";
import Logo from "@/components/Logo";

export default function PageIntrouvable() {
  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>
      <p className="text-sm font-bold uppercase tracking-wider text-vermillon">Erreur 404</p>
      <h1 className="mt-2 font-titre text-[2rem] leading-tight font-semibold">
        Cette page s'est évaporée.
      </h1>
      <p className="mt-4 text-lg text-gris">
        Le lien est peut-être incomplet, ou la page n'existe plus. Tes fantômes,
        eux, sont toujours là.
      </p>
      <div className="mt-8">
        <Link href="/" className="btn">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
