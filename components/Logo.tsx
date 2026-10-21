import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-titre text-xl font-semibold tracking-tight"
      aria-label="Fantômes, accueil"
    >
      <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
        <path
          d="M11 1C5.5 1 2 5 2 10.5V23l3-2.5L8 23l3-2.5 3 2.5 3-2.5 3 2.5V10.5C20 5 16.5 1 11 1Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="10" r="1.6" fill="currentColor" />
        <circle cx="14" cy="10" r="1.6" fill="currentColor" />
      </svg>
      Fantômes
    </Link>
  );
}
