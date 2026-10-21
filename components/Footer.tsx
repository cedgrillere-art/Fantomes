import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-trait mt-16">
      <div className="mx-auto max-w-2xl px-5 py-8 text-sm text-gris">
        <nav aria-label="Informations légales">
          <ul className="flex flex-wrap gap-x-5 gap-y-3">
            <li>
              <Link href="/mentions-legales" className="underline-offset-4 hover:underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/cgv" className="underline-offset-4 hover:underline">
                Conditions générales de vente
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="underline-offset-4 hover:underline">
                Confidentialité
              </Link>
            </li>
          </ul>
        </nav>
        <p className="mt-4">© {new Date().getFullYear()} Fantômes</p>
      </div>
    </footer>
  );
}
