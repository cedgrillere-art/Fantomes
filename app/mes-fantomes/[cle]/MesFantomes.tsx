"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import Logo from "@/components/Logo";
import { euros } from "@/lib/questions";
import { lettreResiliation, conseilEnvoi } from "@/lib/lettres";
import { lireFichier, dedoublonner, ErreurPdf } from "@/lib/releve/fichier";
import { detecter } from "@/lib/releve/detection";
import type { Categorie, Fantome, Frequence } from "@/lib/releve/types";
import { editeur, garantie } from "@/lib/site";

type Ligne = {
  id: string;
  libelle: string;
  categorie: string;
  montant_centimes: number;
  frequence: Frequence;
  cout_annuel_centimes: number;
  dernier_prelevement: string | null;
  statut: "actif" | "resilie";
};

type Veille = { active: boolean; resiliee: boolean; finPeriode: string | null };

type Etat =
  | { etape: "verification" }
  | { etape: "echec"; message: string }
  | { etape: "liste"; lignes: Ligne[]; formule: "audit" | "veille"; veille: Veille | null };

const FREQ: Record<Frequence, string> = {
  hebdomadaire: "par semaine",
  mensuel: "par mois",
  trimestriel: "par trimestre",
  annuel: "par an",
};

function versFantome(l: Ligne): Fantome {
  return {
    id: l.id,
    nom: l.libelle,
    categorie: l.categorie as Categorie,
    montant: l.montant_centimes / 100,
    frequence: l.frequence,
    coutAnnuel: l.cout_annuel_centimes / 100,
    occurrences: 0,
    dernierPrelevement: l.dernier_prelevement ?? "",
    raison: "regulier",
  };
}

function dateLongue(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function MesFantomes() {
  const { cle } = useParams<{ cle: string }>();
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [etat, setEtat] = useState<Etat>({ etape: "verification" });
  const suivi = useRef(false);

  const charger = useCallback(async () => {
    // Le serveur confirme le paiement (webhook Stripe, ou vérification directe auprès de Stripe).
    for (let essai = 0; essai < 8; essai++) {
      try {
        const q = new URLSearchParams({ cle });
        if (sessionId) q.set("session_id", sessionId);
        const rep = await fetch(`/api/acces?${q}`, { cache: "no-store" });
        const json = await rep.json();
        if (rep.ok && json.payee) {
          setEtat({ etape: "liste", lignes: json.prelevements, formule: json.formule, veille: json.veille });
          if (sessionId && !suivi.current) {
            suivi.current = true;
            track("paiement_reussi", { formule: json.formule });
          }
          try {
            localStorage.setItem("fantomes:ma-liste", cle);
          } catch {
            /* stockage indisponible */
          }
          return;
        }
        if (!rep.ok && rep.status !== 500) {
          setEtat({ etape: "echec", message: "Ce lien n'est pas valide. Vérifie que tu l'as copié en entier." });
          return;
        }
        if (json.statutSession === "open" || json.statutSession === "expired" || (!sessionId && rep.ok)) {
          setEtat({
            etape: "echec",
            message: "Le paiement n'a pas abouti. Aucun montant n'a été débité : tu peux réessayer.",
          });
          return;
        }
      } catch {
        /* on réessaie */
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setEtat({
      etape: "echec",
      message: `La confirmation du paiement prend plus de temps que prévu. Recharge cette page dans une minute ; si rien ne change, écris à ${editeur.email}.`,
    });
  }, [cle, sessionId]);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    // Retire session_id de l'adresse : le lien à garder est plus court et plus propre.
    if (etat.etape === "liste" && sessionId) {
      window.history.replaceState(null, "", `/mes-fantomes/${cle}`);
    }
  }, [etat.etape, sessionId, cle]);

  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>
      {etat.etape === "verification" && (
        <section aria-live="polite" className="py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-trait border-t-vermillon" aria-hidden="true" />
          <h1 className="mt-6 font-titre text-2xl font-semibold">Confirmation du paiement…</h1>
          <p className="mt-2 text-gris">Quelques secondes.</p>
        </section>
      )}
      {etat.etape === "echec" && (
        <section>
          <h1 className="font-titre text-[1.85rem] leading-tight font-semibold">Ta liste n'est pas encore débloquée.</h1>
          <p className="mt-4 text-lg text-gris" role="alert">
            {etat.message}
          </p>
          <Link href="/analyse/offre" className="btn mt-8">
            Revenir au paiement
          </Link>
          <Link href="/" className="mt-4 flex min-h-12 items-center justify-center text-gris underline underline-offset-4">
            Retour à l'accueil
          </Link>
        </section>
      )}
      {etat.etape === "liste" && (
        <Liste
          cle={cle}
          lignes={etat.lignes}
          formule={etat.formule}
          veille={etat.veille}
          nouveau={Boolean(sessionId)}
          onRecharger={charger}
          onLignes={(lignes) => setEtat({ ...etat, lignes })}
        />
      )}
    </main>
  );
}

function Liste(props: {
  cle: string;
  lignes: Ligne[];
  formule: "audit" | "veille";
  veille: Veille | null;
  nouveau: boolean;
  onRecharger: () => void;
  onLignes: (l: Ligne[]) => void;
}) {
  const { lignes } = props;
  const total = lignes.reduce((s, l) => s + l.cout_annuel_centimes, 0) / 100;
  const economise = lignes.filter((l) => l.statut === "resilie").reduce((s, l) => s + l.cout_annuel_centimes, 0) / 100;
  const nbResilies = lignes.filter((l) => l.statut === "resilie").length;

  async function basculer(l: Ligne) {
    const statut = l.statut === "resilie" ? "actif" : "resilie";
    props.onLignes(lignes.map((x) => (x.id === l.id ? { ...x, statut } : x)));
    const rep = await fetch("/api/prelevement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cle: props.cle, id: l.id, statut }),
    }).catch(() => null);
    if (!rep?.ok) props.onLignes(lignes); // on annule si l'enregistrement a échoué
    else if (statut === "resilie") track("abonnement_resilie");
  }

  return (
    <section>
      {props.nouveau && (
        <p className="mb-4 rounded-xl bg-sauge px-4 py-3 font-bold text-white">Paiement confirmé. Merci !</p>
      )}
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">Ta liste complète.</h1>

      <div className="mt-5 rounded-xl bg-encre px-5 py-5 text-papier">
        <p className="text-[#d9d2c5]">Économisé sur l'année</p>
        <p className="chiffres font-titre text-4xl font-semibold">{euros(economise)}</p>
        <p className="mt-1 text-[#d9d2c5]">
          {nbResilies === 0
            ? `Sur ${euros(total)} repérés. Marque chaque abonnement résilié : le total se met à jour.`
            : `${nbResilies} ${nbResilies > 1 ? "abonnements résiliés" : "abonnement résilié"} sur ${lignes.length}, pour ${euros(total)} repérés.`}
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {lignes.map((l) => (
          <CarteAbonnement key={l.id} ligne={l} onBasculer={() => basculer(l)} />
        ))}
      </ul>

      {props.formule === "veille" && props.veille && (
        <BlocVeille cle={props.cle} veille={props.veille} onAjout={props.onRecharger} />
      )}

      <GarderLien cle={props.cle} />

      <p className="mt-8 text-sm text-gris">
        Satisfait ou remboursé pendant {garantie.jours} jours : écris à{" "}
        <a className="underline" href={`mailto:${editeur.email}`}>
          {editeur.email}
        </a>
        .
      </p>
    </section>
  );
}

function CarteAbonnement({ ligne, onBasculer }: { ligne: Ligne; onBasculer: () => void }) {
  const [ouverte, setOuverte] = useState(false);
  const [copie, setCopie] = useState(false);
  const f = versFantome(ligne);
  const lettre = lettreResiliation(f);
  const resilie = ligne.statut === "resilie";

  async function copier() {
    try {
      await navigator.clipboard.writeText(lettre);
      setCopie(true);
      track("lettre_copiee");
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setOuverte(true);
    }
  }

  return (
    <li className={`relative rounded-xl border-2 bg-carte p-4 ${resilie ? "border-trait" : "border-encre"}`}>
      {resilie && (
        <span
          className="pointer-events-none absolute right-3 top-3 -rotate-6 rounded border-2 border-vermillon px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-vermillon"
          aria-hidden="true"
        >
          RÉSILIÉ
        </span>
      )}
      <div className={`flex items-start justify-between gap-3 ${resilie ? "opacity-60" : ""}`}>
        <div className="min-w-0">
          <p className="text-lg font-bold">{f.nom}</p>
          <p className="text-gris">
            {euros(f.montant, 2)} {FREQ[f.frequence]}
          </p>
        </div>
        {!resilie && (
          <p className="chiffres shrink-0 text-right font-titre text-2xl font-semibold text-vermillon">
            {euros(f.coutAnnuel)}
            <span className="block text-xs font-normal text-gris">par an</span>
          </p>
        )}
      </div>
      {!resilie && <p className="mt-3 text-sm text-gris">{conseilEnvoi(f)}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setOuverte(!ouverte)}
          className="min-h-12 rounded-xl border-2 border-trait font-bold"
          aria-expanded={ouverte}
        >
          {ouverte ? "Masquer la lettre" : "Voir la lettre"}
        </button>
        <button type="button" onClick={copier} className="min-h-12 rounded-xl bg-encre font-bold text-papier">
          {copie ? "Copiée" : "Copier la lettre"}
        </button>
      </div>
      {ouverte && (
        <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-trait bg-papier p-4 font-texte text-[0.95rem] leading-relaxed">
          {lettre}
        </pre>
      )}
      <button
        type="button"
        onClick={onBasculer}
        className={`mt-3 min-h-12 w-full rounded-xl border-2 font-bold ${
          resilie ? "border-trait text-gris" : "border-vermillon text-vermillon"
        }`}
      >
        {resilie ? "Annuler : il n'est pas résilié" : "Je l'ai résilié"}
      </button>
    </li>
  );
}

function BlocVeille({ cle, veille, onAjout }: { cle: string; veille: Veille; onAjout: () => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [confirmer, setConfirmer] = useState(false);
  const [fin, setFin] = useState<string | null>(veille.resiliee ? veille.finPeriode : null);
  const champ = useRef<HTMLInputElement>(null);

  async function ajouter(fichiers: FileList | null) {
    if (!fichiers?.length) return;
    setOccupe(true);
    setMessage(null);
    try {
      const ops = [];
      for (const f of Array.from(fichiers).slice(0, 12)) ops.push(...(await lireFichier(f)));
      const fantomes = detecter(dedoublonner(ops));
      if (fantomes.length === 0) {
        setMessage("Aucun prélèvement régulier dans ce relevé.");
        return;
      }
      const rep = await fetch("/api/veille/ajout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cle, fantomes }),
      });
      const json = await rep.json();
      if (!rep.ok) throw new Error(json.erreur);
      setMessage(
        json.ajoutes === 0
          ? "Rien de nouveau ce mois-ci : aucun nouveau prélèvement."
          : `${json.ajoutes} ${json.ajoutes > 1 ? "nouveaux prélèvements ajoutés" : "nouveau prélèvement ajouté"} à ta liste.`
      );
      onAjout();
    } catch (e) {
      setMessage(e instanceof ErreurPdf ? e.message : "Ce relevé n'a pas pu être lu. Essaie avec un autre fichier.");
    } finally {
      setOccupe(false);
      if (champ.current) champ.current.value = "";
    }
  }

  async function resilier() {
    setOccupe(true);
    const rep = await fetch("/api/veille/resilier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cle }),
    }).catch(() => null);
    const json = rep ? await rep.json().catch(() => ({})) : {};
    setOccupe(false);
    setConfirmer(false);
    if (rep?.ok) {
      setFin(json.finPeriode ?? "");
      track("veille_resiliee");
    } else {
      setMessage(json.erreur ?? "La résiliation n'a pas abouti. Réessaie.");
    }
  }

  const resiliee = fin !== null;

  return (
    <section className="mt-10 rounded-xl border border-trait bg-carte p-5">
      <h2 className="font-titre text-xl font-semibold">Ta Veille</h2>
      {!resiliee ? (
        <>
          <p className="mt-2 text-gris">
            Chaque mois, dépose ton nouveau relevé : les nouveaux prélèvements s'ajoutent à ta liste. Le
            fichier reste sur ton téléphone.
          </p>
          <input
            ref={champ}
            type="file"
            accept=".pdf,.csv,application/pdf,text/csv"
            multiple
            className="sr-only"
            id="releve-veille"
            onChange={(e) => ajouter(e.target.files)}
          />
          <label htmlFor="releve-veille" className={`btn mt-4 cursor-pointer ${occupe ? "pointer-events-none opacity-60" : ""}`}>
            {occupe ? "Lecture…" : "Déposer le relevé du mois"}
          </label>
        </>
      ) : (
        <p className="mt-2 text-gris">
          Ta Veille est résiliée.{" "}
          {fin ? `Elle reste active jusqu'au ${dateLongue(fin)}, et aucun prélèvement n'aura lieu ensuite.` : "Aucun prélèvement n'aura lieu ensuite."}
        </p>
      )}
      {message && (
        <p className="mt-3 font-bold" role="status">
          {message}
        </p>
      )}
      {!resiliee &&
        (confirmer ? (
          <div className="mt-5 rounded-lg border-2 border-vermillon p-4">
            <p className="font-bold">Résilier la Veille ?</p>
            <p className="mt-1 text-sm text-gris">
              Elle s'arrête à la fin du mois en cours. Ta liste et tes lettres restent accessibles.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmer(false)} className="min-h-12 rounded-xl border-2 border-trait font-bold">
                Garder
              </button>
              <button type="button" onClick={resilier} disabled={occupe} className="min-h-12 rounded-xl bg-vermillon font-bold text-white">
                Résilier
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmer(true)}
            className="mt-4 min-h-12 w-full text-gris underline underline-offset-4"
          >
            Résilier la Veille
          </button>
        ))}
    </section>
  );
}

function GarderLien({ cle }: { cle: string }) {
  const [copie, setCopie] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(`${window.location.origin}/mes-fantomes/${cle}`), [cle]);

  return (
    <section className="mt-10 rounded-xl border border-trait bg-carte p-5">
      <h2 className="font-bold">Garde ce lien pour revenir à ta liste</h2>
      <p className="mt-1 text-sm text-gris">
        C'est ta clé personnelle : ne la partage pas. Ajoute-la à tes favoris ou envoie-la-toi par e-mail.
      </p>
      <p className="mt-3 break-all rounded-lg bg-papier p-3 font-mono text-sm">{url}</p>
      <button
        type="button"
        className="mt-3 min-h-12 w-full rounded-xl bg-encre font-bold text-papier"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopie(true);
            setTimeout(() => setCopie(false), 2500);
          } catch {
            /* copie indisponible : le lien reste affiché */
          }
        }}
      >
        {copie ? "Lien copié" : "Copier mon lien"}
      </button>
    </section>
  );
}
