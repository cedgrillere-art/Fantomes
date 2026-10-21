import { NextResponse } from "next/server";
import { enregistrerPaiement, lireAnalyse, lirePrelevements, validerCle } from "@/lib/serveur/analyses";
import { stripe } from "@/lib/serveur/stripe";
import { supabaseAdmin } from "@/lib/serveur/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Donne accès à la liste complète, seulement si le paiement est confirmé côté serveur.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cle = url.searchParams.get("cle");
  const sessionId = url.searchParams.get("session_id");
  if (!validerCle(cle)) return NextResponse.json({ erreur: "Lien invalide." }, { status: 400 });

  try {
    let analyse = await lireAnalyse(cle);
    if (!analyse) return NextResponse.json({ erreur: "Lien invalide." }, { status: 404 });

    let statutSession: string | null = null;
    // Si le webhook n'est pas encore arrivé, on vérifie directement auprès de Stripe (serveur à serveur).
    if (!analyse.payee && sessionId && /^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      const session = await stripe.lireSession(sessionId);
      statutSession = session.status;
      if (session.metadata?.analyse_id === analyse.id && (await enregistrerPaiement(session))) {
        analyse = await lireAnalyse(cle);
      }
    }
    if (!analyse?.payee) {
      return NextResponse.json({ payee: false, statutSession });
    }

    const prelevements = await lirePrelevements(analyse.id);
    let veille: { active: boolean; finPeriode: string | null; resiliee: boolean } | null = null;
    if (analyse.formule === "veille") {
      const { data } = await supabaseAdmin()
        .from("paiements")
        .select("statut, fin_periode")
        .eq("analyse_id", analyse.id)
        .eq("formule", "veille")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      veille = {
        active: data?.statut === "actif",
        resiliee: data?.statut === "resilie",
        finPeriode: data?.fin_periode ?? null,
      };
    }
    return NextResponse.json({ payee: true, formule: analyse.formule, prelevements, veille });
  } catch (e) {
    console.error("acces", e);
    return NextResponse.json({ erreur: "Vérification impossible, réessaie." }, { status: 500 });
  }
}
