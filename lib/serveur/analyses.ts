import "server-only";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "./supabase";
import type { SessionStripe } from "./stripe";

export const FREQUENCES = ["hebdomadaire", "mensuel", "trimestriel", "annuel"] as const;
const PAR_AN: Record<(typeof FREQUENCES)[number], number> = { hebdomadaire: 52, mensuel: 12, trimestriel: 4, annuel: 1 };
const CATEGORIES = ["video", "musique", "applis", "logiciel", "telecom", "assurance", "sport", "presse", "banque", "livraison", "autre"];

export type PrelevementValide = {
  libelle: string;
  categorie: string;
  montant_centimes: number;
  frequence: (typeof FREQUENCES)[number];
  cout_annuel_centimes: number;
  dernier_prelevement: string | null;
};

/** Validation serveur stricte de ce que le navigateur envoie. Renvoie null si invalide. */
export function validerFantomes(brut: unknown): PrelevementValide[] | null {
  if (!Array.isArray(brut) || brut.length === 0 || brut.length > 80) return null;
  const out: PrelevementValide[] = [];
  for (const f of brut) {
    if (!f || typeof f !== "object") return null;
    const o = f as Record<string, unknown>;
    const nom = typeof o.nom === "string" ? o.nom.replace(/\s+/g, " ").trim().slice(0, 120) : "";
    const montant = typeof o.montant === "number" ? o.montant : NaN;
    const frequence = o.frequence as PrelevementValide["frequence"];
    if (!nom || !Number.isFinite(montant) || montant <= 0 || montant >= 100000) return null;
    if (!FREQUENCES.includes(frequence)) return null;
    const centimes = Math.round(montant * 100);
    const date =
      typeof o.dernierPrelevement === "string" && /^\d{4}-\d{2}-\d{2}$/.test(o.dernierPrelevement)
        ? o.dernierPrelevement
        : null;
    out.push({
      libelle: nom,
      categorie: typeof o.categorie === "string" && CATEGORIES.includes(o.categorie) ? o.categorie : "autre",
      montant_centimes: centimes,
      frequence,
      cout_annuel_centimes: centimes * PAR_AN[frequence], // recalculé ici, jamais repris du navigateur
      dernier_prelevement: date,
    });
  }
  return out;
}

export function validerCle(cle: unknown): cle is string {
  return typeof cle === "string" && /^[a-f0-9]{48}$/.test(cle);
}

export async function creerAnalyse(prelevements: PrelevementValide[], reponses: unknown): Promise<string> {
  const db = supabaseAdmin();
  const cle = randomBytes(24).toString("hex");
  const rep: Record<string, string> = {};
  if (reponses && typeof reponses === "object") {
    for (const k of ["nombre", "relecture", "oubli"]) {
      const v = (reponses as Record<string, unknown>)[k];
      if (typeof v === "string") rep[k] = v.slice(0, 60);
    }
  }
  const { data, error } = await db
    .from("analyses")
    .insert({ cle_acces: cle, reponses: rep })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "insertion analyse");
  const { error: e2 } = await db
    .from("prelevements")
    .insert(prelevements.map((p) => ({ ...p, analyse_id: data.id })));
  if (e2) throw new Error(e2.message);
  return cle;
}

export async function lireAnalyse(cle: string) {
  const { data, error } = await supabaseAdmin()
    .from("analyses")
    .select("id, payee, formule, email")
    .eq("cle_acces", cle)
    .maybeSingle();
  if (error) throw new Error(`Supabase : ${error.message}`); // ex. clé secrète invalide
  return data as { id: string; payee: boolean; formule: "audit" | "veille" | null; email: string | null } | null;
}

export async function lirePrelevements(analyseId: string) {
  const { data } = await supabaseAdmin()
    .from("prelevements")
    .select("id, libelle, categorie, montant_centimes, frequence, cout_annuel_centimes, dernier_prelevement, statut")
    .eq("analyse_id", analyseId)
    .order("cout_annuel_centimes", { ascending: false });
  return data ?? [];
}

/**
 * Enregistre un paiement confirmé par Stripe. Idempotent : peut être appelé
 * par le webhook ET par la page de retour sans créer de doublon.
 */
export async function enregistrerPaiement(session: SessionStripe): Promise<boolean> {
  if (session.status !== "complete") return false;
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return false;
  const analyseId = session.metadata?.analyse_id;
  const formule = session.metadata?.formule === "veille" ? "veille" : "audit";
  if (!analyseId) return false;
  const email = session.customer_details?.email ?? "";
  const db = supabaseAdmin();

  const { error } = await db.from("paiements").upsert(
    {
      analyse_id: analyseId,
      email: email.slice(0, 320) || "inconnu",
      formule,
      montant_centimes: session.amount_total ?? 0,
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      statut: formule === "veille" ? "actif" : "paye",
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);

  const { error: e2 } = await db
    .from("analyses")
    .update({ payee: true, formule, email: email.slice(0, 320) || null })
    .eq("id", analyseId);
  if (e2) throw new Error(e2.message);
  return true;
}
