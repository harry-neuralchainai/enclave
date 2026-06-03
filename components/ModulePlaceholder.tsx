type Props = {
  eyebrow: string;
  title: string;
  sub: string;
  cardTitle?: string;
  note: string;
};

export default function ModulePlaceholder({
  eyebrow,
  title,
  sub,
  cardTitle = "Coming in the next phase",
  note,
}: Props) {
  return (
    <main className="main">
      <div className="page-head">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{sub}</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 620 }}>
        <div className="card-title">{cardTitle}</div>
        <p className="card-sub">{note}</p>
      </div>
    </main>
  );
}
