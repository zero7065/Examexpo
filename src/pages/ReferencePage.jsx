// Reference Library: searchable formula tables, constants, grammar rules.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { REFERENCE_SHEETS } from "../data/reference";
import { BOOK_RECS, BOOK_SUBJECTS } from "../data/resources";
import { Search, ArrowLeft, BookOpen, LibraryBig } from "lucide-react";

export default function ReferencePage() {
  const [tab, setTab] = useState("sheets");
  const [sheetId, setSheetId] = useState(REFERENCE_SHEETS[0].id);
  const [query, setQuery] = useState("");
  const [bookSubject, setBookSubject] = useState("All");
  const [bookQuery, setBookQuery] = useState("");

  const books = BOOK_RECS.filter(
    (b) =>
      (bookSubject === "All" || b.subject === bookSubject) &&
      (!bookQuery.trim() ||
        `${b.title} ${b.note} ${b.where}`.toLowerCase().includes(bookQuery.trim().toLowerCase()))
  );

  const sheet = REFERENCE_SHEETS.find((s) => s.id === sheetId) || REFERENCE_SHEETS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sheet.groups;
    return sheet.groups
      .map((g) => ({
        ...g,
        rows: g.rows.filter(
          ([a, b]) => a.toLowerCase().includes(q) || b.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.rows.length > 0);
  }, [sheet, query]);

  return (
    <div className="page-content max-w-4xl mx-auto space-y-6">
      <Link to="/help" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600 }}>
        <ArrowLeft size={16} /> Help
      </Link>
      <header>
        <h1 className="h-1 flex items-center gap-2"><BookOpen size={26} className="text-primary" /> Reference Library</h1>
        <p className="lead">Formula sheets, constants, tables and grammar rules — searchable offline.</p>
      </header>

      <div className="flex gap-2">
        <button onClick={() => setTab("sheets")} className={tab === "sheets" ? "btn-primary" : "btn-secondary"} style={{ padding: "10px 18px", fontSize: 13 }}>
          <BookOpen size={15} /> Formula Sheets
        </button>
        <button onClick={() => setTab("books")} className={tab === "books" ? "btn-primary" : "btn-secondary"} style={{ padding: "10px 18px", fontSize: 13 }}>
          <LibraryBig size={15} /> Books & Tools
        </button>
      </div>

      {tab === "books" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={bookSubject} onChange={(e) => setBookSubject(e.target.value)} className="input-field" style={{ maxWidth: 220 }}>
              {BOOK_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} placeholder="Search books & tools…" className="input-field" style={{ paddingLeft: 40 }} />
            </div>
          </div>
          {books.length === 0 && <p className="text-sm text-text-muted">No matches.</p>}
          <div className="grid-auto">
            {books.map((b, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)" }}>{b.subject}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "var(--bg-3)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>{b.type}</span>
                </div>
                <div className="font-bold text-text text-sm mb-1">{b.title}</div>
                <div className="text-sm text-text-muted mb-2" style={{ lineHeight: 1.55 }}>{b.note}</div>
                <div className="text-xs text-text-muted">📍 {b.where}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted">We list titles and where to get them legally — never pirated PDFs. In-app tools open right inside ExamPadi.</p>
        </>
      ) : (
      <>
      <div className="flex gap-2 flex-wrap">
        {REFERENCE_SHEETS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSheetId(s.id); setQuery(""); }}
            className={sheetId === s.id ? "btn-primary" : "btn-secondary"}
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            {s.emoji} {s.title}
          </button>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${sheet.title.toLowerCase()}… e.g. "quadratic" or "pH"`}
          className="input-field"
          style={{ paddingLeft: 40 }}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-text-muted">No matches — try a different word.</p>
      )}

      {filtered.map((g) => (
        <div key={g.name} className="glass-card p-5">
          <h2 className="font-black text-text mb-3">{g.name}</h2>
          <div className="table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {g.rows.map(([a, b], i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--primary)", verticalAlign: "top", whiteSpace: "nowrap" }}>{a}</td>
                    <td style={{ padding: "10px 12px", color: "var(--text)", lineHeight: 1.6 }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      </>
      )}
    </div>
  );
}
