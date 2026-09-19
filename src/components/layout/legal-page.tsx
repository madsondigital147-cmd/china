import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 bg-muted/30 py-12 sm:py-16">
        <article className="container-app max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
          <div className="prose-sm prose mt-8 max-w-none space-y-4 text-sm leading-relaxed text-foreground">
            {children}
          </div>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}