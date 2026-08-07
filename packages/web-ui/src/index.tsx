export interface FoundationPageProps {
  readonly description: string;
  readonly surface: string;
}

export function FoundationPage({ description, surface }: FoundationPageProps) {
  return (
    <main className="foundation-shell">
      <section aria-labelledby="foundation-title" className="foundation-card">
        <p className="foundation-eyebrow">Rate My Representatives</p>
        <h1 id="foundation-title">{surface}</h1>
        <p>{description}</p>
        <p role="status" className="foundation-status">
          Foundation only — civic features are not operational.
        </p>
      </section>
    </main>
  );
}
