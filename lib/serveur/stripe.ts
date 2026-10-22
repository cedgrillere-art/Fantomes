import "server-only";

// Appels directs à l'API Stripe (sans SDK) : moins de dépendances, mêmes garanties.
// La clé secrète vient uniquement des variables d'environnement du serveur.

const API = "https://api.stripe.com/v1";

function cle(): string {
  const k = process.env.STRIPE_SECRET_KEY?.trim();
  if (!k) throw new Error("STRIPE_SECRET_KEY manquante");
  return k;
}

/** Encode un objet en paramètres de formulaire Stripe (a[b][0][c]=…). */
function encoder(obj: Record<string, unknown>, prefixe = "", out: string[] = []): string[] {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const nom = prefixe ? `${prefixe}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((el, i) => {
        if (el !== null && typeof el === "object") encoder(el as Record<string, unknown>, `${nom}[${i}]`, out);
        else out.push(`${encodeURIComponent(`${nom}[${i}]`)}=${encodeURIComponent(String(el))}`);
      });
    } else if (typeof v === "object") {
      encoder(v as Record<string, unknown>, nom, out);
    } else {
      out.push(`${encodeURIComponent(nom)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

export class ErreurStripe extends Error {}

async function appel<T>(methode: "GET" | "POST" | "DELETE", chemin: string, params?: Record<string, unknown>): Promise<T> {
  const corps = params ? encoder(params).join("&") : undefined;
  const url = methode === "GET" && corps ? `${API}${chemin}?${corps}` : `${API}${chemin}`;
  const rep = await fetch(url, {
    method: methode,
    headers: {
      Authorization: `Bearer ${cle()}`,
      ...(methode !== "GET" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: methode !== "GET" ? corps : undefined,
    cache: "no-store",
  });
  const json = await rep.json();
  if (!rep.ok) throw new ErreurStripe(json?.error?.message ?? `Erreur Stripe ${rep.status}`);
  return json as T;
}

export type SessionStripe = {
  id: string;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  mode: "payment" | "subscription";
  amount_total: number | null;
  customer: string | null;
  subscription: string | null;
  customer_details: { email: string | null } | null;
  metadata: Record<string, string>;
  client_secret?: string;
};

export type AbonnementStripe = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  metadata: Record<string, string>;
  items?: { data: Array<{ current_period_end?: number }> };
  current_period_end?: number;
};

export type EvenementStripe = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export const stripe = {
  prixParCle: (cles: string[]) =>
    appel<{ data: Array<{ id: string; lookup_key: string; unit_amount: number }> }>("GET", "/prices", {
      lookup_keys: cles,
      active: "true",
    }),
  creerSession: (params: Record<string, unknown>) => appel<SessionStripe>("POST", "/checkout/sessions", params),
  lireSession: (id: string) => appel<SessionStripe>("GET", `/checkout/sessions/${encodeURIComponent(id)}`),
  /** Relit un événement chez Stripe : c'est ce qui garantit qu'il est authentique. */
  lireEvenement: (id: string) => appel<EvenementStripe>("GET", `/events/${encodeURIComponent(id)}`),
  lireAbonnement: (id: string) => appel<AbonnementStripe>("GET", `/subscriptions/${encodeURIComponent(id)}`),
  resilierAbonnement: (id: string) =>
    appel<AbonnementStripe>("POST", `/subscriptions/${encodeURIComponent(id)}`, { cancel_at_period_end: "true" }),
};
