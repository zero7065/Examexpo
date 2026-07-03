import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../lib/userProfile";
import { getFilteredQuestions, getTopics, getAllSubjects, getTotalCount } from "../data/questions/index";
import { ChevronRight, ChevronLeft, Search, BookOpen } from "lucide-react";

const DIFFICULTY_COLORS = { easy: "#4ADE80", medium: "#FF9F43", hard: "#FF4D6A" };

export default function QuestionBank() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const [filters, setFilters] = useState({
    subject: "All Subjects",
    topic: "",
    exam: "ALL",
    difficulty: "ALL",
    yearFrom: "2018",
    yearTo: "2023",
  });

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(setProfile).catch(() => {});
  }, [user]);

  const userSubjects = profile?.subjects || [];
  const allSubjects = getAllSubjects();
  const subjectOptions = ["All Subjects", ...allSubjects.filter(s => userSubjects.includes(s) || !userSubjects.length)];

  const topics = filters.subject && filters.subject !== "All Subjects" ? getTopics(filters.subject) : [];

  const filtered = getFilteredQuestions(filters);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleStartPractice() {
    const qs = filtered.slice(0, 20);
    navigate("/practice", { state: { questions: qs, subject: filters.subject === "All Subjects" ? "Mixed" : filters.subject, mode: "practice" } });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px" }}>
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Question Bank</h1>
          <p style={{ color: "#888", fontSize: 14, margin: "4px 0 0" }}>Browse {getTotalCount()} past questions across all subjects</p>
        </div>

        {/* Filter bar */}
        <div style={{ background: "#0d0d12", borderBottom: "1px solid #1e1e2a", padding: 16, position: "sticky", top: 0, zIndex: 10, marginBottom: 20, borderRadius: 12, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <select value={filters.subject} onChange={e => updateFilter("subject", e.target.value)} style={{ background: "#1a1a1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
            {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {topics.length > 0 && (
            <select value={filters.topic} onChange={e => updateFilter("topic", e.target.value)} style={{ background: "#1a1a1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }}>
              <option value="">All Topics</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          {["ALL", "JAMB", "WAEC"].map(e => (
            <button key={e} onClick={() => updateFilter("exam", e)} style={{ padding: "6px 14px", borderRadius: 20, border: filters.exam === e ? "1px solid #6C3CE9" : "1px solid #333", background: filters.exam === e ? "rgba(108,60,233,0.2)" : "transparent", color: filters.exam === e ? "#fff" : "#888", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {e === "ALL" ? "ALL" : e}
            </button>
          ))}

          {["ALL", "Easy", "Medium", "Hard"].map(d => (
            <button key={d} onClick={() => updateFilter("difficulty", d)} style={{ padding: "6px 14px", borderRadius: 20, border: filters.difficulty === d ? "1px solid #6C3CE9" : "1px solid #333", background: filters.difficulty === d ? "rgba(108,60,233,0.2)" : "transparent", color: filters.difficulty === d ? "#fff" : "#888", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {d}
            </button>
          ))}

          <input type="number" placeholder="From" value={filters.yearFrom} onChange={e => updateFilter("yearFrom", e.target.value)} style={{ width: 64, background: "#1a1a1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          <input type="number" placeholder="To" value={filters.yearTo} onChange={e => updateFilter("yearTo", e.target.value)} style={{ width: 64, background: "#1a1a1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />

          <button onClick={handleStartPractice} style={{ marginLeft: "auto", padding: "10px 20px", borderRadius: 10, border: "none", background: "#6C3CE9", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            Practice {filtered.length > 20 ? "20" : filtered.length} Questions <ChevronRight size={16} />
          </button>
        </div>

        {/* Question list */}
        {paged.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
            <BookOpen size={48} style={{ opacity: 0.3, margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>No questions found</h3>
            <p style={{ fontSize: 14 }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paged.map(q => {
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id} style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 12, padding: 16, cursor: "pointer" }} onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: DIFFICULTY_COLORS[q.difficulty], marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: isExpanded ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.question}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(108,60,233,0.15)", color: "#6C3CE9", fontSize: 11, fontWeight: 600 }}>{q.topic}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#888", fontSize: 11, fontWeight: 500 }}>{q.year}</span>
                        {q.exam.map(e => <span key={e} style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(0,229,160,0.1)", color: "#00E5A0", fontSize: 11, fontWeight: 600 }}>{e}</span>)}
                      </div>
                    </div>
                    <ChevronRight size={18} color="#888" style={{ flexShrink: 0, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e1e2a" }}>
                      <div style={{ display: "grid", gap: 8 }}>
                        {Object.entries(q.options).map(([key, val]) => (
                          <div key={key} style={{ padding: "10px 14px", borderRadius: 8, border: key === q.answer ? "1.5px solid #4ADE80" : "1px solid #2a2a35", background: key === q.answer ? "rgba(74,222,128,0.08)" : "#1a1a1f", display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ width: 24, height: 24, borderRadius: 6, background: key === q.answer ? "#4ADE80" : "#333", color: key === q.answer ? "#000" : "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{key}</span>
                            <span style={{ fontSize: 13, color: key === q.answer ? "#4ADE80" : "#ccc" }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: "rgba(108,60,233,0.1)", borderLeft: "3px solid #6C3CE9" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#6C3CE9", textTransform: "uppercase", marginBottom: 6 }}>Explanation</div>
                        <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.5, margin: 0 }}>{q.explanation}</p>
                        {q.hint && <p style={{ fontSize: 12, color: "#D4A853", marginTop: 8, fontStyle: "italic" }}>💡 {q.hint}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, alignItems: "center" }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 16px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: page <= 1 ? "#555" : "#fff", cursor: page <= 1 ? "not-allowed" : "pointer" }}><ChevronLeft size={16} /></button>
            <span style={{ color: "#888", fontSize: 13 }}>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 16px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: page >= totalPages ? "#555" : "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer" }}><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}