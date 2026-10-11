// Reference Library: searchable formula tables, constants, grammar rules.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { REFERENCE_SHEETS } from "../data/reference";
import { Search, ArrowLeft, BookOpen } from "lucide-react";

export default function ReferencePage() {
  const [sheetId, setSheetId] = useState(REFERENCE_SHEETS[0].id);
  const [query, setQuery] = useState("");

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
    </div>
  );
}
