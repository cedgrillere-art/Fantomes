// Jeu d'icônes maison : même grille (24 px), même trait (2 px), bouts arrondis,
// comme le fantôme du logo. Une seule famille d'icônes sur tout le site.

type Props = { className?: string; taille?: number };

function Base({ className, taille = 24, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Loupe posée sur une ligne de relevé : « tout est repéré ». */
export function IconeLoupe(p: Props) {
  return (
    <Base {...p}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
      <path d="M8 10.5h5" />
    </Base>
  );
}

/** Enveloppe : « la lettre est prête ». */
export function IconeLettre(p: Props) {
  return (
    <Base {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </Base>
  );
}

/** Pièce qui revient : « ce que tu récupères ». */
export function IconePiece(p: Props) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.2a3 3 0 1 0 0 5.6" />
      <path d="M8.5 11h4M8.5 13h4" />
    </Base>
  );
}

/** Banque barrée : « sans connecter ta banque ». */
export function IconeBanque(p: Props) {
  return (
    <Base {...p}>
      <path d="M4 9.5L12 5l8 4.5" />
      <path d="M6 10v7M10 10v7M14 10v7M18 10v7" />
      <path d="M4 19h16" />
      <path d="M3 3l18 18" />
    </Base>
  );
}

/** Téléphone : « ton relevé reste sur ton téléphone ». */
export function IconeTelephone(p: Props) {
  return (
    <Base {...p}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </Base>
  );
}

/** Ticket : « un seul paiement ». */
export function IconeTicket(p: Props) {
  return (
    <Base {...p}>
      <path d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.5a2.5 2.5 0 0 0 0-5V7z" />
      <path d="M10 9.5v5" strokeDasharray="1.5 2" />
    </Base>
  );
}

/** Main ouverte : « on ne te vend rien d'autre ». */
export function IconeMain(p: Props) {
  return (
    <Base {...p}>
      <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M11 11V5a1.5 1.5 0 0 1 3 0v6" />
      <path d="M14 11V6.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16.2L2.8 13.5a1.4 1.4 0 0 1 2.4-1.4L8 15" />
    </Base>
  );
}

/** Balance : « la loi est de ton côté ». */
export function IconeBalance(p: Props) {
  return (
    <Base {...p}>
      <path d="M12 4v16M8 20h8" />
      <path d="M5 7h14" />
      <path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0L5 7zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7z" />
    </Base>
  );
}

/** Document : relevé à télécharger. */
export function IconeDocument(p: Props) {
  return (
    <Base {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </Base>
  );
}

/** Œil : « voir un exemple ». */
export function IconeOeil(p: Props) {
  return (
    <Base {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </Base>
  );
}

/** Pastille ronde qui porte une icône, même rendu partout. */
export function Pastille({ children, ton = "encre" }: { children: React.ReactNode; ton?: "encre" | "vermillon" | "sauge" }) {
  const couleurs = {
    encre: "border-encre text-encre",
    vermillon: "border-vermillon text-vermillon",
    sauge: "border-sauge text-sauge",
  }[ton];
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-carte ${couleurs}`}>
      {children}
    </span>
  );
}
