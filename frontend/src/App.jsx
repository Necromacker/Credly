import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { gsap } from "gsap";

const API = "https://intelli-credit.onrender.com";

/* ─── helpers ───────────────────────────────────────────────── */
const decisionColor = d =>
  d === "APPROVE" ? "#10b981"
  : d?.includes("CONDITION") || d?.includes("REFER") ? "#f59e0b"
  : "#ef4444";

const riskColor = r =>
  ({ LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#ef4444", CRITICAL: "#b91c1c" }[r] || "#a1a1aa");

/* ─── color palette (Investink inspired) ────────────────────── */
const COLORS = {
  primary: "#ff69b4", // vibrant pink
  secondary: "#8b5cf6", // purple
  accent: "#3b82f6", // blue
  bg: "#fdfcfd",
  card: "#ffffff",
  text: "#1a1d1f",
  subtext: "#52525b",
  border: "#f1f1f5"
};

/* ─── global CSS ─────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Inter', sans-serif; background: ${COLORS.bg}; color: ${COLORS.text}; overflow-x: hidden; }
  input::placeholder { color: #a1a1aa; }
  input:focus { outline: none; }
  button { font-family: 'Inter', sans-serif; transition: all 0.2s ease; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

/* ─── icons ──────────────────────────────────────────────────── */
const Icons = {
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Analysis: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Score: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Research: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Report: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
};

/* ─── spinner ────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={COLORS.primary} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── buttons ────────────────────────────────────────────────── */
function PrimaryBtn({ children, onClick, disabled, loading, style = {}, secondary }) {
  const ref = useRef(null);
  const handleEnter = () => !disabled && gsap.to(ref.current, { scale: 1.03, duration: 0.15 });
  const handleLeave = () => !disabled && gsap.to(ref.current, { scale: 1, duration: 0.15 });
  return (
    <button ref={ref} onClick={onClick} disabled={disabled}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}
      style={{
        padding: "16px 32px",
        background: disabled ? "#f1f1f5" : secondary ? "#fff" : COLORS.primary,
        color: disabled ? "#a1a1aa" : secondary ? COLORS.text : "#fff",
        border: secondary ? `1px solid ${COLORS.border}` : "none",
        borderRadius: "30px", fontSize: "16px", fontWeight: "700",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled || secondary ? "none" : `0 8px 24px rgba(244, 114, 182, 0.25)`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        ...style
      }}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

/* ─── animated page ──────────────────────────────────────────── */
function AnimatedPage({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
  }, []);
  return <div ref={ref} style={{ width: "100%" }}>{children}</div>;
}

/* ─── card ───────────────────────────────────────────────────── */
function Card({ children, style = {}, active }) {
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
      borderRadius: "24px", padding: "32px",
      boxShadow: active ? "0 20px 40px rgba(244, 114, 182, 0.08)" : "0 10px 30px rgba(0,0,0,0.02)",
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── score arc ──────────────────────────────────────────────── */
function ScoreArc({ score }) {
  const r = 70, cx = 90, cy = 90;
  const circ = Math.PI * r;
  const progress = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : score >= 50 ? "#f97316" : "#ef4444";
  return (
    <svg width="180" height="110" viewBox="0 0 180 110">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#f1f1f5" strokeWidth="12" strokeLinecap="round"/>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${progress} ${circ}`} style={{ transition: "stroke-dasharray 1s ease-out" }}/>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={COLORS.text} fontSize="32" fontWeight="800" fontFamily="Inter">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={COLORS.subtext} fontSize="11" fontFamily="Inter">out of 100</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */
function HomePage({ onStart }) {
  const heroRef = useRef(null);
  const whyRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(whyRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3 });
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* Hero Section */}
      <section ref={heroRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: "#fdf2f8", color: COLORS.primary, padding: "8px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", marginBottom: "24px" }}>
            Coming soon · Credly will have mobile app soon!
          </div>
          <h1 style={{ fontSize: "64px", fontWeight: "900", lineHeight: 1.1, color: COLORS.text, marginBottom: "24px" }}>
            We're creating better way to <span style={{ color: COLORS.primary }}>invest for the future</span>
          </h1>
          <p style={{ fontSize: "18px", color: COLORS.subtext, lineHeight: 1.6, marginBottom: "40px", maxWidth: "480px" }}>
            Intelligent management software to control future investment accounting. Every your funds are taken into account for need future.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <PrimaryBtn onClick={onStart} style={{ padding: "18px 40px" }}>Discover now</PrimaryBtn>
            <PrimaryBtn secondary onClick={onStart} style={{ border: "none" }}>Learn more →</PrimaryBtn>
          </div>
          <div style={{ display: "flex", gap: "40px", marginTop: "60px" }}>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>70B <span style={{ fontSize: "14px", color: COLORS.subtext, fontWeight: "500" }}>Llama 3 AI Engines</span></div>
            </div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "900" }}>100% <span style={{ fontSize: "14px", color: COLORS.subtext, fontWeight: "500" }}>Bank-Grade CAM Reports</span></div>
            </div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          {/* Main illustration placeholder (Generated image would go here) */}
          <div style={{ width: "100%", height: "500px", background: "linear-gradient(135deg, #fff, #fdf2f8)", borderRadius: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <img src="/1.png" alt="Illustration" style={{ width: "80%", height: "auto", borderRadius: "20px" }} />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ textAlign: "center", padding: "100px 24px", background: "#fff" }}>
        <h2 style={{ fontSize: "48px", fontWeight: "900", marginBottom: "16px" }}>Why should choose us</h2>
        <p style={{ color: COLORS.subtext, marginBottom: "80px" }}>Because we always think of user needs and provide the best</p>

        <div ref={whyRef} style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}>
          <div style={{ padding: "40px" }}>
            <img src="/2.png" alt="AI" style={{ width: "120px", marginBottom: "32px" }} />
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>AI Financial Parsing</h3>
            <p style={{ color: COLORS.subtext, lineHeight: 1.6 }}>Leverage Llama 3 70B to instantly extract complex financial data from any PDF, digital or scanned.</p>
          </div>
          <div style={{ padding: "40px" }}>
            <img src="/3.png" alt="Scoring" style={{ width: "120px", marginBottom: "32px" }} />
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>5Cs Credit Scoring</h3>
            <p style={{ color: COLORS.subtext, lineHeight: 1.6 }}>Comprehensive risk assessment across Character, Capacity, Capital, Collateral, and Conditions.</p>
          </div>
          <div style={{ padding: "40px" }}>
            <img src="/4.png" alt="Intelligence" style={{ width: "120px", marginBottom: "32px" }} />
            <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>Real-time Intelligence</h3>
            <p style={{ color: COLORS.subtext, lineHeight: 1.6 }}>Live web research agent scans NCLT, court records, and news for high-speed background verification.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════════ */
function DashboardPage({ results, companyName, onGoAnalysis }) {
  const hasData = !!(results.score || results.analyze || results.upload);

  if (!hasData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>📊</div>
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.text, marginBottom: "12px" }}>No Analysis Yet</h2>
        <p style={{ fontSize: "16px", color: COLORS.subtext, marginBottom: "32px", maxWidth: "400px", lineHeight: 1.6 }}>Run a full appraisal analysis to see real-time financial data, credit scores, and risk signals here.</p>
        <PrimaryBtn onClick={onGoAnalysis} style={{ width: "auto", padding: "16px 40px" }}>
          Start Analysis →
        </PrimaryBtn>
      </div>
    );
  }

  const score = results.score;
  const analyze = results.analyze;
  const research = results.research;
  const fins = analyze?.financials || {};

  /* Parse the research summary into structured sections */
  const parseSummary = (text) => {
    if (!text) return { riskLevel: "", findings: [], summary: "" };
    const riskMatch = text.match(/RISK LEVEL:\s*(\w+)/i);
    const riskLevel = riskMatch ? riskMatch[1] : "";
    const findings = [];
    const findingsMatch = text.match(/KEY FINDINGS:(.+?)(?:\d+\.\s*SUMMARY:|SUMMARY:|$)/is);
    if (findingsMatch) {
      findingsMatch[1].split(/\*/).filter(s => s.trim()).forEach(f => findings.push(f.trim()));
    }
    const summaryMatch = text.match(/SUMMARY:(.+)/is);
    const summary = summaryMatch ? summaryMatch[1].trim() : text;
    return { riskLevel, findings, summary };
  };

  const parsed = research ? parseSummary(research.summary) : null;

  return (
    <AnimatedPage>
      {/* Row 1: Score + Financials */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Score Card */}
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: COLORS.subtext, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>Credit Quality</div>
          <div style={{ fontSize: "72px", fontWeight: "900", lineHeight: 1, color: COLORS.text, letterSpacing: "-3px" }}>{score?.score ?? "—"}</div>
          <div style={{ fontSize: "14px", color: COLORS.subtext, marginTop: "6px", marginBottom: "16px" }}>out of 100</div>
          {score && (
            <>
              <div style={{ fontSize: "22px", fontWeight: "900", color: decisionColor(score.decision), marginBottom: "12px" }}>{score.decision}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                <div style={{ padding: "6px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}>Grade: {score.grade}</div>
                <div style={{ padding: "6px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}>{score.interest_rate}</div>
              </div>
              <div style={{ marginTop: "12px", padding: "8px 16px", background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: "8px", fontSize: "13px", color: COLORS.primary, fontWeight: "700" }}>
                ₹{score.suggested_loan_limit_crore} Cr limit
              </div>
            </>
          )}
        </Card>

        {/* Financial Highlights */}
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Icons.Analysis /> Financial Highlights
            {companyName && <span style={{ marginLeft: "auto", fontSize: "13px", color: COLORS.subtext, fontWeight: "600", padding: "4px 12px", background: COLORS.bg, borderRadius: "8px" }}>{companyName}</span>}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Revenue", value: fins.revenue || fins.Revenue || "—", color: "#fdf2f8" },
              { label: "Profit", value: fins.profit || fins.Profit || "—", color: "#f0f9ff" },
              { label: "EBITDA", value: fins.ebitda || fins.EBITDA || "—", color: "#f5f3ff" },
              { label: "Net Worth", value: fins.net_worth || fins["Net Worth"] || "—", color: "#fdf2fb" },
              { label: "Debt", value: fins.total_debt || fins["Total Debt"] || "—", color: "#fff7f0" },
              { label: "Assets", value: fins.total_assets || fins["Total Assets"] || "—", color: "#f0fdf4" },
            ].map(item => (
              <div key={item.label} style={{ background: item.color, padding: "20px", borderRadius: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", opacity: 0.6, textTransform: "uppercase", marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "20px", fontWeight: "900" }}>{item.value === "null" ? "—" : item.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Risk Signals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Red Flags */}
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", color: "#ef4444" }}>⚠ Red Flags</h3>
          {score?.red_flags?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {score.red_flags.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px", background: "#fff5f5", borderRadius: "12px", border: "1px solid #fee2e2" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", marginTop: "7px", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#991b1b", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: COLORS.subtext, fontSize: "14px" }}>{score ? "✓ No major red flags detected" : "Run analysis to see risk signals"}</p>
          )}
        </Card>

        {/* Positive Signals */}
        <Card>
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", color: "#22c55e" }}>✓ Positive Signals</h3>
          {score?.positive_signals?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {score.positive_signals.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", marginTop: "7px", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: "#166534", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: COLORS.subtext, fontSize: "14px" }}>{score ? "No positive signals found" : "Run analysis to see signals"}</p>
          )}
        </Card>
      </div>

      {/* Row 3: Web Research */}
      <Card>
        <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Icons.Research /> Web Intelligence Report
          {research && (
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", color: riskColor(parsed?.riskLevel || research.risk_level), background: `${riskColor(parsed?.riskLevel || research.risk_level)}12`, border: `1px solid ${riskColor(parsed?.riskLevel || research.risk_level)}30` }}>
              <span style={{ width: "6px", height: "6px", background: riskColor(parsed?.riskLevel || research.risk_level), borderRadius: "50%", display: "inline-block" }} />
              {parsed?.riskLevel || research.risk_level}
            </span>
          )}
        </h3>
        {research ? (
          <div>
            {/* Key Findings */}
            {parsed.findings.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#92400e", marginBottom: "12px" }}>🔎 Key Findings</h4>
                {parsed.findings.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", marginTop: "7px", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "#78350f", lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: COLORS.text, marginBottom: "10px" }}>📋 Summary</h4>
              <p style={{ fontSize: "14px", color: COLORS.subtext, lineHeight: 1.7 }}>{parsed.summary}</p>
            </div>

            {/* Sources */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>🔍</span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0369a1" }}>{research.sources?.length || 0} external sources analysed</span>
            </div>
          </div>
        ) : (
          <p style={{ color: COLORS.subtext, fontSize: "14px" }}>Run analysis to see web research results</p>
        )}
      </Card>
    </AnimatedPage>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Step1Upload({ file, setFile, onNext, loading, result }) {
  return (
    <AnimatedPage>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "#fdf2f8", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: COLORS.primary }}>
          <Icons.Upload />
        </div>
        <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px" }}>Upload Financials</h2>
        <p style={{ color: COLORS.subtext, marginBottom: "40px" }}>We support Annual Reports, Balance Sheets, and Bank Statements.</p>

        <label style={{ display: "block", border: `2px dashed ${COLORS.border}`, borderRadius: "24px", padding: "60px", cursor: "pointer", transition: "all 0.3s", background: file ? "#fdf2f8" : "transparent" }}>
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>{file ? "📃" : "📁"}</div>
          <div style={{ fontSize: "18px", fontWeight: "800" }}>{file ? file.name : "Choose PDF or drag it here"}</div>
          <p style={{ fontSize: "14px", color: COLORS.subtext, marginTop: "8px" }}>Max file size 8MB</p>
        </label>

        {result && <div style={{ marginTop: "24px", color: "#10b981", fontWeight: "700" }}>Successfully extracted {result.characters_extracted} characters!</div>}

        <div style={{ marginTop: "40px" }}>
          <PrimaryBtn onClick={onNext} disabled={!file || loading} loading={loading} style={{ margin: "0 auto" }}>
            {loading ? "Processing..." : result ? "Continue →" : "Upload Document"}
          </PrimaryBtn>
        </div>
      </div>
    </AnimatedPage>
  );
}

function Step2Analyze({ companyName, setCompanyName, onNext, loading, result }) {
  return (
    <AnimatedPage>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "#f0f9ff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: "#0ea5e9" }}>
          <Icons.Analysis />
        </div>
        <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px" }}>Who are we analyzing?</h2>
        <p style={{ color: COLORS.subtext, marginBottom: "40px" }}>Our AI will cross-reference the financials with the company name.</p>

         <input type="text" placeholder="Enter Company Name (e.g. Tata Motors)" value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          style={{ width: "100%", padding: "20px 24px", border: `1px solid ${COLORS.border}`, borderRadius: "16px", fontSize: "18px", fontWeight: "600", marginBottom: "32px", textAlign: "center" }} />

        {result && (
           <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
             {Object.entries(result.financials).map(([k, v]) => (
               <div key={k} style={{ padding: "12px", background: COLORS.bg, borderRadius: "12px" }}>
                 <div style={{ fontSize: "10px", fontWeight: "800", opacity: 0.5, textTransform: "uppercase" }}>{k}</div>
                 <div style={{ fontSize: "16px", fontWeight: "900" }}>{v === "null" ? "—" : v}</div>
               </div>
             ))}
           </div>
        )}

        <PrimaryBtn onClick={onNext} disabled={!companyName || loading} loading={loading} style={{ margin: "0 auto" }}>
          {loading ? "Analyzing..." : result ? "Continue →" : "Start Analysis"}
        </PrimaryBtn>
      </div>
    </AnimatedPage>
  );
}

function Step3Score({ onNext, loading, result }) {
  const scoreRef = useRef(null);
  useEffect(() => {
    if (result && scoreRef.current)
      gsap.fromTo(scoreRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });
  }, [result]);
  return (
    <AnimatedPage>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "#f5f3ff", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: COLORS.secondary }}>
          <Icons.Score />
        </div>
        <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px" }}>Appraisal Engine</h2>
        <p style={{ color: COLORS.subtext, marginBottom: "40px" }}>Scores the company across the 5 Cs of Credit — Character, Capacity, Capital, Collateral, Conditions.</p>

        {!result && (
          <>
            <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, borderRadius: "24px", marginBottom: "40px" }}>
              <p style={{ color: COLORS.subtext, fontSize: "14px" }}>Ready to calculate score</p>
            </div>
            <PrimaryBtn onClick={onNext} disabled={loading} loading={loading} style={{ margin: "0 auto" }}>
              {loading ? "Calculating..." : "Generate Score"}
            </PrimaryBtn>
          </>
        )}

        {result && (
          <div ref={scoreRef} style={{ textAlign: "left" }}>
            {/* Score + Decision Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px", background: COLORS.bg, borderRadius: "20px", padding: "36px", marginBottom: "20px" }}>
              <div style={{ textAlign: "center", paddingRight: "32px", borderRight: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: "72px", fontWeight: "900", lineHeight: 1, color: COLORS.text, letterSpacing: "-3px" }}>{result.score}</div>
                <div style={{ fontSize: "14px", color: COLORS.subtext, marginTop: "6px" }}>out of 100</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "28px", fontWeight: "900", color: decisionColor(result.decision), letterSpacing: "-1px", marginBottom: "16px" }}>{result.decision}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ padding: "8px 16px", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>Grade: {result.grade}</div>
                  <div style={{ padding: "8px 16px", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>{result.interest_rate}</div>
                  <div style={{ padding: "8px 16px", background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: "8px", fontSize: "14px", color: COLORS.primary, fontWeight: "700" }}>₹{result.suggested_loan_limit_crore} Cr limit</div>
                </div>
              </div>
            </div>

            {/* Red Flags + Positive Signals */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "28px" }}>
              {result.red_flags?.length > 0 && (
                <div style={{ background: "#fff5f5", border: "1px solid #fee2e2", borderRadius: "16px", padding: "24px" }}>
                  <div style={{ fontWeight: "800", color: "#ef4444", marginBottom: "14px", fontSize: "16px" }}>⚠ Red Flags</div>
                  {result.red_flags.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", marginTop: "7px", flexShrink: 0 }} />
                      <span style={{ fontSize: "14px", color: "#991b1b", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.positive_signals?.length > 0 && (
                <div style={{ background: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: "16px", padding: "24px" }}>
                  <div style={{ fontWeight: "800", color: "#22c55e", marginBottom: "14px", fontSize: "16px" }}>✓ Positive Signals</div>
                  {result.positive_signals.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", marginTop: "7px", flexShrink: 0 }} />
                      <span style={{ fontSize: "14px", color: "#166534", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <PrimaryBtn onClick={onNext} style={{ margin: "0 auto" }}>Continue →</PrimaryBtn>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}

function Step4Research({ onNext, loading, result }) {
  /* Parse the summary into structured sections */
  const parseSummary = (text) => {
    if (!text) return { riskLevel: "", findings: [], summary: "" };
    const riskMatch = text.match(/RISK LEVEL:\s*(\w+)/i);
    const riskLevel = riskMatch ? riskMatch[1] : "";
    const findings = [];
    const findingsMatch = text.match(/KEY FINDINGS:(.+?)(?:\d+\.\s*SUMMARY:|SUMMARY:|$)/is);
    if (findingsMatch) {
      findingsMatch[1].split(/\*/).filter(s => s.trim()).forEach(f => findings.push(f.trim()));
    }
    const summaryMatch = text.match(/SUMMARY:(.+)/is);
    const summary = summaryMatch ? summaryMatch[1].trim() : text;
    return { riskLevel, findings, summary };
  };

  const parsed = result ? parseSummary(result.summary) : null;

  return (
    <AnimatedPage>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "#fff7ed", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: "#f97316" }}>
          <Icons.Research />
        </div>
        <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px" }}>Web Research</h2>
        <p style={{ color: COLORS.subtext, marginBottom: "40px" }}>AI agent scans news, NCLT filings, court records and regulatory alerts in real-time.</p>

        {!result && (
          <>
            <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, borderRadius: "24px", marginBottom: "40px" }}>
              <p style={{ color: COLORS.subtext, fontSize: "14px" }}>Ready for background check</p>
            </div>
            <PrimaryBtn onClick={onNext} disabled={loading} loading={loading} style={{ margin: "0 auto" }}>
              {loading ? "Searching..." : "Start Research"}
            </PrimaryBtn>
          </>
        )}

        {result && (
          <div style={{ textAlign: "left" }}>
            {/* Risk Level Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "100px", fontWeight: "700", fontSize: "14px", color: riskColor(parsed.riskLevel || result.risk_level), background: `${riskColor(parsed.riskLevel || result.risk_level)}12`, border: `1px solid ${riskColor(parsed.riskLevel || result.risk_level)}30`, marginBottom: "24px" }}>
              <span style={{ width: "8px", height: "8px", background: riskColor(parsed.riskLevel || result.risk_level), borderRadius: "50%", display: "inline-block" }} />
              Risk Level: {parsed.riskLevel || result.risk_level}
            </div>

            {/* Key Findings */}
            {parsed.findings.length > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#92400e", marginBottom: "16px" }}>🔎 Key Findings</h4>
                {parsed.findings.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", marginTop: "7px", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "#78350f", lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "800", color: COLORS.text, marginBottom: "12px" }}>📋 Summary</h4>
              <p style={{ fontSize: "15px", color: COLORS.subtext, lineHeight: 1.8 }}>{parsed.summary}</p>
            </div>

            {/* Sources */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "16px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>🔍</span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0369a1" }}>{result.sources?.length || 0} external sources analysed</span>
            </div>

            <PrimaryBtn onClick={onNext} style={{ margin: "0 auto" }}>Continue →</PrimaryBtn>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}

function Step5Report({ onDownload, loading, companyName }) {
  return (
    <AnimatedPage>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "#f0fdf4", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", color: "#22c55e" }}>
          <Icons.Report />
        </div>
        <h2 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px" }}>Ready for Export</h2>
        <p style={{ color: COLORS.subtext, marginBottom: "40px" }}>Download your Professional Credit Appraisal Memo.</p>

        <Card style={{ marginBottom: "40px", display: "flex", gap: "20px", alignItems: "center", textAlign: "left" }}>
          <div style={{ fontSize: "40px" }}>📄</div>
          <div>
            <div style={{ fontWeight: "800" }}>CAM_{companyName || "Company"}.docx</div>
            <div style={{ fontSize: "12px", color: COLORS.subtext }}>Word Document · Appraisal Memo</div>
          </div>
        </Card>

        <PrimaryBtn onClick={onDownload} disabled={loading} loading={loading} style={{ margin: "0 auto" }}>
          {loading ? "Generating..." : "Download Memo"}
        </PrimaryBtn>
      </div>
    </AnimatedPage>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [appTab, setAppTab] = useState("analysis");
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState({});

  const post = async (url, data) => {
    setError(""); setLoading(true);
    try { const res = await axios.post(API + url, data); return res.data; }
    catch (e) { setError(e.response?.data?.detail || e.message); return null; }
    finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (results.upload) { setStep(1); return; }
    if (!file) return;
    const form = new FormData(); form.append("file", file);
    const data = await post("/upload", form);
    if (data) setResults(r => ({ ...r, upload: data }));
  };

  const handleAnalyze = async () => {
    if (results.analyze) { setStep(2); return; }
    if (!companyName.trim()) return;
    const form = new FormData(); form.append("company_name", companyName);
    const data = await post("/analyze", form);
    if (data) setResults(r => ({ ...r, analyze: data }));
  };

  const handleScore = async () => {
    if (results.score) { setStep(3); return; }
    const data = await post("/score", {});
    if (data) setResults(r => ({ ...r, score: data }));
  };

  const handleResearch = async () => {
    if (results.research) { setStep(4); return; }
    const data = await post("/research", {});
    if (data) setResults(r => ({ ...r, research: data }));
  };

  const handleDownload = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.post(API + "/generate-cam", {}, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = `CAM_${companyName}.docx`; a.click();
    } catch { setError("Download failed."); }
    finally { setLoading(false); }
  };

  const renderContent = () => {
    if (page === "home") return <HomePage onStart={() => { setPage("app"); setAppTab("analysis"); }} />;
    if (appTab === "dashboard") return <DashboardPage results={results} companyName={companyName} onGoAnalysis={() => setAppTab("analysis")} />;

    const steps = [
      <Step1Upload key={0} file={file} setFile={setFile} onNext={handleUpload} loading={loading} result={results.upload} />,
      <Step2Analyze key={1} companyName={companyName} setCompanyName={setCompanyName} onNext={handleAnalyze} loading={loading} result={results.analyze} />,
      <Step3Score key={2} onNext={handleScore} loading={loading} result={results.score} />,
      <Step4Research key={3} onNext={handleResearch} loading={loading} result={results.research} />,
      <Step5Report key={4} onDownload={handleDownload} loading={loading} companyName={companyName} />,
    ];

    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Step Progress */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "40px", justifyContent: "center" }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width: "40px", height: "6px", borderRadius: "10px", background: i <= step ? COLORS.primary : COLORS.border, transition: "all 0.3s" }} />
          ))}
        </div>
        <Card>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: COLORS.subtext, cursor: "pointer", fontSize: "14px", fontWeight: "700", marginBottom: "24px", padding: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Step {step}
            </button>
          )}
          {steps[step]}
        </Card>
      </div>
    );
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <nav style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setPage("home")}>
             <div style={{ width: "40px", height: "40px", background: COLORS.primary, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "20px" }}>C</div>
             <span style={{ fontSize: "24px", fontWeight: "900" }}>Credly</span>
          </div>

          <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            <span style={{ fontWeight: "700", cursor: "pointer", color: page === "home" ? COLORS.primary : COLORS.text }} onClick={() => setPage("home")}>Home</span>
            <div style={{ display: "flex", gap: "12px" }}>
              <PrimaryBtn secondary onClick={() => { setPage("app"); setAppTab("dashboard"); }} style={{ padding: "10px 24px", fontSize: "14px" }}>Dashboard</PrimaryBtn>
              <PrimaryBtn onClick={() => { setPage("app"); setAppTab("analysis"); }} style={{ padding: "10px 24px", fontSize: "14px" }}>Analysis</PrimaryBtn>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: page === "home" ? 0 : "60px 24px" }}>
          {renderContent()}
          {error && <div style={{ textAlign: "center", marginTop: "40px", color: "#ef4444", fontWeight: "600" }}>⚠ {error}</div>}
        </main>
      </div>
    </>
  );
}