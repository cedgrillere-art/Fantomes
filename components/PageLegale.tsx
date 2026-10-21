import Logo from "@/components/Logo";

export default function PageLegale({
  titre,
  majLe,
  children,
}: {
  titre: string;
  majLe: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">{titre}</h1>
      <p className="mt-2 text-sm text-gris">Dernière mise à jour : {majLe}</p>
      <div className="prose-legale mt-6">{children}</div>
    </main>
  );
}
