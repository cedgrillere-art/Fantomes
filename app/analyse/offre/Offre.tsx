"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { track } from "@vercel/analytics";
import Logo from "@/components/Logo";
import type { Fantome } from "@/lib/releve/types";
import { euros } from "@/lib/questions";
import { editeur, garantie, stripePublic } from "@/lib/site";

type Formule = "audit" | "veille";

const stripePromise = /^pk_(test|live)_[A-Za-z0-9]+$/.test(stripePublic.cle)
  ? loadStripe(stripePublic.cle).catch(() => null)
  : null;

function lireResultat(): { fantomes: Fantome[]; reponses: unknown } | null {
  try {
    const f = JSON.parse(sessionStorage.getItem("fantomes:resultat") ?? "null") as Fantome[] | null;
    if (!f || !Array.isArray(f) || f.length === 0) return null;
    const r = JSON.parse(sessionStorage.getItem("fantomes:reponses") ?? "null");
    return { fantomes: f, reponses: r };
  } catch {
    return null;
  }
}

/** Enregistre la liste détectée une seule fois et garde la clé d'accès. */
async function obtenirCle(fantomes: Fantome[], reponses: unknown): Promise<string> {
  const empreinte = JSON.stringify(fantomes.map((f) => [f.nom, f.montant, f.frequence]));
  try {
    const cle = sessionStorage.getItem("fantomes:cle");
    if (cle && sessionStorage.getItem("fantomes:cle-pour") === empreinte) return cle;
  } catch {
    /* stockage indisponible */
  }
  const rep = await fetch("/api/analyse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fantomes, reponses }),
  });
  const json = (await rep.json()) as { cle?: string; erreur?: string };
  if (!rep.ok || !json.cle) throw new Error(json.erreur ?? "Enregistrement impossible.");
  try {
    sessionStorage.setItem("fantomes:cle", json.cle);
    sessionStorage.setItem("fantomes:cle-pour", empreinte);
  } catch {
    /* stockage indisponible */
  }
  return json.cle;
}

export default function Offre() {
  const router = useRouter();
  const [donnees, setDonnees] = useState<{ fantomes: Fantome[]; reponses: unknown } | null | undefined>(undefined);
  const [cle, setCle] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [formule, setFormule] = useState<Formule>("audit");

  useEffect(() => {
    // Si Stripe ne se charge pas (clé publique invalide, réseau), on l'affiche au lieu d'un bloc vide.
    stripePromise?.then((s) => {
      if (!s) setErreur("Le formulaire de paiement n'a pas pu se charger. Réessaie dans un instant.");
    });
    const d = lireResultat();
    setDonnees(d);
    if (!d) return;
    track("paywall_vu", { fantomes: d.fantomes.length });
    obtenirCle(d.fantomes, d.reponses)
      .then(setCle)
      .catch(() => setErreur("Ta liste n'a pas pu être préparée. Vérifie ta connexion et recharge la page."));
  }, []);

  const fetchClientSecret = useCallback(async () => {
    const rep = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cle, formule }),
    });
    const json = (await rep.json()) as { clientSecret?: string; dejaPayee?: boolean; erreur?: string };
    if (json.dejaPayee && cle) {
      router.push(`/mes-fantomes/${cle}`);
      throw new Error("Déjà payée");
    }
    if (!rep.ok || !json.clientSecret) {
      setErreur(json.erreur ?? "Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
      throw new Error(json.erreur ?? "checkout");
    }
    return json.clientSecret;
  }, [cle, formule, router]);

  const total = useMemo(() => donnees?.fantomes.reduce((s, f) => s + f.coutAnnuel, 0) ?? 0, [donnees]);

  if (donnees === undefined) return <main className="min-h-[70dvh]" />;

  if (donnees === null) {
    return (
      <main className="mx-auto max-w-xl px-5">
        <header className="pt-5 pb-8">
          <Logo />
        </header>
        <h1 className="font-titre text-[1.85rem] leading-tight font-semibold">
          Commence par déposer ton relevé.
        </h1>
        <p className="mt-4 text-lg text-gris">
          Fantômes a besoin de ta liste pour te la débloquer. Ça prend une minute, et ton relevé reste
          sur ton téléphone.
        </p>
        <Link href="/analyse" className="btn mt-8">
          Déposer mon relevé
        </Link>
      </main>
    );
  }

  const n = donnees.fantomes.length;
  const jours = total > 0 ? Math.max(1, Math.ceil(19 / (total / 365))) : null;

  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-6">
        <Logo />
      </header>

      {/* 1. Ce qui a été fait */}
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">Voilà ta liste, prête.</h1>
      <p className="mt-3 text-lg text-gris">
        {n} {n > 1 ? "abonnements repérés" : "abonnement repéré"}, classés par coût, avec une lettre
        de résiliation déjà rédigée pour chacun.
      </p>

      {/* 2. Ce que ça représente, face au prix */}
      <div className="mt-6 rounded-xl bg-encre px-5 py-5 text-papier">
        <p className="text-[#d9d2c5]">Ensemble, ils te coûtent</p>
        <p className="chiffres font-titre text-4xl font-semibold">
          {euros(total)} <span className="text-xl font-normal">par an</span>
        </p>
        <p className="mt-3 text-[#d9d2c5]">
          L'audit complet coûte <strong className="text-papier">19 €, une fois</strong>
          {jours ? (
            <>
              {" "}
              : moins que ce que tes abonnements te coûtent en {jours} {jours > 1 ? "jours" : "jour"}.
            </>
          ) : (
            "."
          )}
        </p>
      </div>

      {/* 4. Garantie, visible sans défiler */}
      <div className="mt-4 flex gap-3 rounded-xl border-2 border-sauge/40 bg-carte p-4">
        <Coche />
        <p className="text-[0.95rem]">
          <strong>Satisfait ou remboursé pendant {garantie.jours} jours.</strong> Un e-mail suffit, sans
          justification. Le remboursement est lancé sous {garantie.delaiLancement} (visible sous 5 à 10
          jours selon ta banque).
        </p>
      </div>

      {/* 3. Les formules */}
      <h2 className="mt-8 font-titre text-xl font-semibold">Choisis ta formule</h2>
      <div className="mt-3 space-y-3" role="radiogroup" aria-label="Formule">
        <CarteFormule
          active={formule === "audit"}
          onClick={() => setFormule("audit")}
          titre="Audit complet"
          badge="Recommandé"
          prix="19 €"
          unite="une fois"
          detail="Soit 1,58 € par mois sur un an, 5 centimes par jour."
          points={["Les noms de tous tes abonnements", "Une lettre de résiliation pour chacun", "Ton total économisé, mis à jour"]}
        />
        <CarteFormule
          active={formule === "veille"}
          onClick={() => setFormule("veille")}
          titre="Audit + Veille"
          prix="19 €"
          unite="puis 4 €/mois"
          detail="La Veille démarre dans un mois : 4 € par mois, 13 centimes par jour."
          points={[
            "Tout l'audit complet",
            "Chaque mois, ton nouveau relevé : les nouveaux prélèvements s'ajoutent à ta liste",
          ]}
        />
      </div>

      {/* 5 et 6. Paiement sur le même écran */}
      <div className="mt-8" id="paiement">
        <p className="mb-3 flex items-center gap-2 font-bold">
          <Coche petit />
          {formule === "audit"
            ? "Paiement unique : rien d'autre ne sera prélevé."
            : "Sans engagement, résiliable à tout moment, en un clic."}
        </p>
        {erreur ? (
          <div className="rounded-xl border-2 border-vermillon bg-carte p-4" role="alert">
            <p className="font-bold">{erreur}</p>
            <button type="button" className="btn mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </div>
        ) : !stripePromise ? (
          <p className="rounded-xl border border-trait bg-carte p-4 text-gris">
            Le paiement est en cours d'installation. Reviens dans quelques minutes.
          </p>
        ) : !cle ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-trait bg-carte">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trait border-t-vermillon" aria-label="Chargement" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-trait bg-white">
            <EmbeddedCheckoutProvider key={`${cle}-${formule}`} stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
        <p className="mt-3 text-center text-sm text-gris">
          Paiement sécurisé par Stripe. Fantômes ne voit jamais ta carte.
        </p>
      </div>

      {/* 7. Les quatre questions */}
      <section className="mt-12" aria-labelledby="faq">
        <h2 id="faq" className="font-titre text-xl font-semibold">
          Tes questions
        </h2>
        <div className="mt-3 divide-y divide-trait rounded-xl border border-trait bg-carte">
          <Question q="Est-ce que ça marche pour mon cas ?">
            Tu as déjà la réponse sous les yeux : la liste que tu débloques est celle trouvée dans ton
            propre relevé. Fantômes lit les relevés PDF et les exports CSV des banques françaises. Et si
            elle ne te sert pas, tu es remboursé.
          </Question>
          <Question q="Combien de temps ça me prend ?">
            La liste est déjà prête. Compte deux minutes par abonnement : copier la lettre et l'envoyer,
            ou cliquer sur « Résilier » dans ton compte chez le service.
          </Question>
          <Question q="Et si je veux arrêter ?">
            L'audit est un paiement unique : il n'y a rien à arrêter. La Veille se résilie en un clic
            depuis ta liste ; elle s'arrête à la fin du mois en cours, sans aucun prélèvement ensuite. Et
            pendant {garantie.jours} jours, un e-mail suffit pour être remboursé.
          </Question>
          <Question q="À quoi sert exactement ce que je paie ?">
            À obtenir le nom de chaque abonnement repéré, sa lettre de résiliation prête à envoyer, et le
            total que tu récupères, mis à jour à chaque résiliation. Ton relevé, lui, n'est jamais envoyé
            ni conservé.
          </Question>
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-gris">
        Une question ? Écris à{" "}
        <a className="underline" href={`mailto:${editeur.email}`}>
          {editeur.email}
        </a>
      </p>
    </main>
  );
}

function CarteFormule(props: {
  active: boolean;
  onClick: () => void;
  titre: string;
  badge?: string;
  prix: string;
  unite: string;
  detail: string;
  points: string[];
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={props.active}
      onClick={props.onClick}
      className={`choix block w-full rounded-xl border-2 bg-carte p-4 text-left transition-colors ${
        props.active ? "border-vermillon" : "border-trait"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-lg font-bold">
            {props.titre}
            {props.badge && (
              <span className="rounded-full bg-vermillon px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                {props.badge}
              </span>
            )}
          </p>
          <p className="chiffres mt-1">
            <span className="font-titre text-2xl font-semibold">{props.prix}</span>{" "}
            <span className="text-gris">{props.unite}</span>
          </p>
        </div>
        <span
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            props.active ? "border-vermillon" : "border-trait"
          }`}
          aria-hidden="true"
        >
          {props.active && <span className="h-3 w-3 rounded-full bg-vermillon" />}
        </span>
      </div>
      <p className="mt-1 text-sm text-gris">{props.detail}</p>
      <ul className="mt-3 space-y-1 text-[0.95rem]">
        {props.points.map((p) => (
          <li key={p} className="flex gap-2">
            <Coche petit />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group px-4">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-bold">
        {q}
        <span className="text-xl text-gris transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <p className="pb-4 text-gris">{children}</p>
    </details>
  );
}

function Coche({ petit }: { petit?: boolean }) {
  const t = petit ? 18 : 24;
  return (
    <svg width={t} height={t} viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 shrink-0 text-sauge">
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
