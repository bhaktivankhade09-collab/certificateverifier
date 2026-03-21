import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet, useContract, hashFile } from "./hooks/useBlockchain";
import QRCode from "qrcode";

// ─── Theme ───────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "#0a0a0f",
    bgCard: "#111118",
    bgCardHover: "#16161f",
    border: "#1e1e2e",
    borderHover: "#2a2a3e",
    text: "#e8e8f0",
    textMuted: "#6b6b8a",
    textDim: "#3a3a55",
    accent: "#7c6af7",
    accentGlow: "rgba(124,106,247,0.15)",
    accentHover: "#9585f9",
    success: "#22d3a0",
    successBg: "rgba(34,211,160,0.08)",
    danger: "#f06292",
    dangerBg: "rgba(240,98,146,0.08)",
    warn: "#fbbf24",
    warnBg: "rgba(251,191,36,0.08)",
    info: "#38bdf8",
    infoBg: "rgba(56,189,248,0.08)",
    grid: "rgba(124,106,247,0.03)",
  },
  light: {
    bg: "#f5f5fa",
    bgCard: "#ffffff",
    bgCardHover: "#f9f9ff",
    border: "#e2e2ee",
    borderHover: "#c8c8e8",
    text: "#1a1a2e",
    textMuted: "#6b6b8a",
    textDim: "#b0b0cc",
    accent: "#5b4fe8",
    accentGlow: "rgba(91,79,232,0.1)",
    accentHover: "#7c6af7",
    success: "#0d9f7a",
    successBg: "rgba(13,159,122,0.08)",
    danger: "#e0416b",
    dangerBg: "rgba(224,65,107,0.08)",
    warn: "#d97706",
    warnBg: "rgba(217,119,6,0.08)",
    info: "#0284c7",
    infoBg: "rgba(2,132,199,0.08)",
    grid: "rgba(91,79,232,0.025)",
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────
const formatAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const isExpired = (ts) => ts && Number(ts) * 1000 < Date.now();

const copyToClipboard = (text) => navigator.clipboard.writeText(text);

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, toast };
};

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    wallet: <><rect x="2" y="5" width="20" height="14" rx="2"/><polyline points="2 10 22 10"/></>,
    upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    qr: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="3" y="3" width="1" height="1" fill="currentColor"/><rect x="14" y="3" width="1" height="1" fill="currentColor"/><rect x="3" y="14" width="1" height="1" fill="currentColor"/><line x1="14" y1="14" x2="17" y2="14"/><line x1="14" y1="17" x2="14" y2="20"/><line x1="17" y1="17" x2="20" y2="17"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    hex: <><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("guide");
  const t = themes[theme];
  const { toasts, toast } = useToast();
  const { account, signer, provider, chainId, connecting, error: walletError, connect, disconnect } = useWallet();
  const { issueCertificate, verifyCertificate, revokeCertificate, getIssuerCertificates } = useContract(signer, provider);

  useEffect(() => {
    if (walletError) toast(walletError, "danger");
  }, [walletError]);

  const isWrongNetwork = chainId && chainId !== 11155111;

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Sora', 'DM Sans', sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 40px 40px; } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .btn { cursor:pointer; border:none; outline:none; font-family:inherit; transition:all 0.2s; }
        .btn:active { transform: scale(0.97); }
        .input { outline:none; font-family:inherit; transition:all 0.2s; width:100%; }
        .card-hover:hover { transform:translateY(-2px); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${theme === "dark" ? "invert(1)" : "none"}; opacity:0.5; }
      `}</style>

      {/* Decorative background layer */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        {theme === "dark" && (
          <div style={{
            position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
            width: "60vw", height: "40vh", borderRadius: "50%",
            background: `radial-gradient(ellipse, ${t.accentGlow} 0%, transparent 70%)`,
          }} />
        )}
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: theme === "dark" ? "rgba(10,10,15,0.85)" : "rgba(245,245,250,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${t.border}`,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${t.accent}, ${t.info})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="hex" size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
            Cert<span style={{ color: t.accent }}>Chain</span>
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
            background: t.accentGlow, color: t.accent,
            border: `1px solid ${t.accent}44`, borderRadius: 4, padding: "2px 6px",
          }}>BETA</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isWrongNetwork && (
            <div style={{
              fontSize: 12, color: t.warn, background: t.warnBg,
              border: `1px solid ${t.warn}44`, borderRadius: 6, padding: "4px 10px",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="alert" size={12} color={t.warn} /> Switch to Sepolia
            </div>
          )}
          {account ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: t.successBg, border: `1px solid ${t.success}44`,
                borderRadius: 8, padding: "6px 12px",
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: t.success, animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: t.success }}>
                  {formatAddress(account)}
                </span>
              </div>
              <button className="btn" onClick={disconnect} style={{
                background: t.dangerBg, border: `1px solid ${t.danger}44`,
                color: t.danger, borderRadius: 8, padding: "6px 12px", fontSize: 12,
              }}>Disconnect</button>
            </div>
          ) : (
            <button className="btn" onClick={connect} disabled={connecting} style={{
              background: t.accent, color: "#fff", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
              opacity: connecting ? 0.7 : 1,
            }}>
              {connecting ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : <Icon name="wallet" size={14} color="#fff" />}
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
          <button className="btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{
            width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: t.bgCard, border: `1px solid ${t.border}`, color: t.textMuted,
          }}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px", position: "relative", zIndex: 2 }}>
        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: t.accentGlow, border: `1px solid ${t.accent}33`,
            borderRadius: 20, padding: "5px 14px", marginBottom: 20, fontSize: 12,
            color: t.accent, fontWeight: 500,
          }}>
            <Icon name="shield" size={12} color={t.accent} />
            Blockchain-powered certificate verification
          </div>
        </div>
        <h1 className="fade-up" style={{
          fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700,
          letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 16,
          animationDelay: "0.15s",
        }}>
          Issue & Verify Certificates
          <br />
          <span style={{ color: t.accent }}>on the Blockchain</span>
        </h1>
        <p className="fade-up" style={{
          fontSize: 16, color: t.textMuted, maxWidth: 520, margin: "0 auto 40px",
          lineHeight: 1.7, animationDelay: "0.2s",
        }}>
          Tamper-proof. Permanent. Verifiable by anyone, anywhere — no central authority needed.
        </p>

        {/* Stats */}
        <div className="fade-up" style={{
          display: "flex", justifyContent: "center", gap: 40, animationDelay: "0.25s",
        }}>
          {[["Immutable", "On-chain storage"], ["Instant", "Verification"], ["Zero", "Server needed"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>{v}</div>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap",
        padding: "0 24px 32px", position: "relative", zIndex: 2,
      }}>
        {[
          { id: "guide",  label: "Get Started",        icon: "book"   },
          { id: "issue",  label: "Issue Certificate",  icon: "upload" },
          { id: "verify", label: "Verify Certificate", icon: "shield" },
          { id: "manage", label: "My Certificates",    icon: "list"   },
        ].map(({ id, label, icon }) => (
          <button key={id} className="btn" onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
            background: tab === id ? t.accent : t.bgCard,
            color: tab === id ? "#fff" : t.textMuted,
            border: `1px solid ${tab === id ? t.accent : t.border}`,
            boxShadow: tab === id ? `0 0 20px ${t.accentGlow}` : "none",
          }}>
            <Icon name={icon} size={15} color={tab === id ? "#fff" : t.textMuted} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 80px", position: "relative", zIndex: 2 }}>
        {tab === "guide"  && <GuideTab  t={t} connect={connect} account={account} setTab={setTab} />}
        {tab === "issue"  && <IssueTab  t={t} account={account} connect={connect} issueCertificate={issueCertificate} toast={toast} theme={theme} />}
        {tab === "verify" && <VerifyTab t={t} account={account} connect={connect} verifyCertificate={verifyCertificate} toast={toast} theme={theme} />}
        {tab === "manage" && <ManageTab t={t} account={account} connect={connect} getIssuerCertificates={getIssuerCertificates} revokeCertificate={revokeCertificate} toast={toast} theme={theme} />}
      </div>

      {/* ── Toasts ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(({ id, msg, type }) => (
          <div key={id} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: type === "success" ? t.successBg : type === "danger" ? t.dangerBg : t.infoBg,
            border: `1px solid ${type === "success" ? t.success : type === "danger" ? t.danger : t.info}44`,
            color: type === "success" ? t.success : type === "danger" ? t.danger : t.info,
            borderRadius: 10, padding: "10px 16px", fontSize: 13,
            backdropFilter: "blur(12px)", animation: "toastIn 0.3s ease",
            maxWidth: 340,
          }}>
            <Icon name={type === "success" ? "check" : type === "danger" ? "x" : "info"} size={14}
              color={type === "success" ? t.success : type === "danger" ? t.danger : t.info} />
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Guide Tab ────────────────────────────────────────────────────────────────
function GuideTab({ t, connect, account, setTab }) {
  const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;

  const steps = [
    {
      number: "01",
      title: "Install MetaMask",
      description: "MetaMask is a browser wallet required to sign transactions on the Ethereum blockchain. Install the browser extension from the official website.",
      action: { label: "Download MetaMask", href: "https://metamask.io/download/" },
      done: hasMetaMask,
      color: t.info,
      colorBg: t.infoBg,
    },
    {
      number: "02",
      title: "Switch to Sepolia Testnet",
      description: "CertChain runs on the Sepolia test network. Open MetaMask, click the network name at the top, and select Sepolia. If it's not listed, go to MetaMask Settings → Advanced and enable \"Show test networks\".",
      done: false,
      color: t.warn,
      colorBg: t.warnBg,
    },
    {
      number: "03",
      title: "Get Free Test ETH",
      description: "You need a small amount of Sepolia ETH to pay gas fees when issuing certificates. Use the faucet below — paste your wallet address and it will send you test ETH for free.",
      action: { label: "Open Sepolia Faucet", href: "https://sepoliafaucet.com/" },
      done: false,
      color: t.warn,
      colorBg: t.warnBg,
    },
    {
      number: "04",
      title: "Connect Your Wallet",
      description: "Click the button below to link MetaMask to CertChain. A MetaMask popup will appear asking for permission — click Connect. Your wallet address will then appear in the top navbar.",
      done: !!account,
      color: t.accent,
      colorBg: t.accentGlow,
      isConnect: true,
    },
    {
      number: "05",
      title: "Issue a Certificate",
      description: "Go to the Issue Certificate tab. Upload the certificate file (PDF or image), fill in the student name, course, institution and expiry date, then click Issue Certificate. MetaMask will ask you to confirm — approve the transaction and wait a few seconds for it to be recorded on-chain.",
      done: false,
      color: t.success,
      colorBg: t.successBg,
      navigate: "issue",
      navigateLabel: "Go to Issue Certificate",
    },
    {
      number: "06",
      title: "Verify a Certificate",
      description: "Go to the Verify Certificate tab and upload the exact same file that was issued. CertChain hashes the file and checks the blockchain — you'll instantly see whether it's authentic, expired, or revoked, along with the full certificate details.",
      done: false,
      color: t.success,
      colorBg: t.successBg,
      navigate: "verify",
      navigateLabel: "Go to Verify Certificate",
    },
  ];

  return (
    <div className="fade-up">

      {/* Header card */}
      <div style={{
        background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: 16, padding: "24px 28px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: t.accentGlow, border: `1px solid ${t.accent}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="book" size={22} color={t.accent} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>Getting Started with CertChain</div>
          <div style={{ fontSize: 13, color: t.textMuted, marginTop: 3, lineHeight: 1.5 }}>
            Follow these 6 steps to start issuing tamper-proof certificates on the Ethereum blockchain.
          </div>
        </div>
      </div>

      {/* Step cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            background: t.bgCard,
            border: `1px solid ${step.done ? step.color + "55" : t.border}`,
            borderRadius: 14, padding: "18px 22px",
            transition: "border-color 0.2s",
          }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

              {/* Step badge */}
              <div style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: step.done ? step.color : step.colorBg,
                border: `2px solid ${step.done ? step.color : step.color + "55"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {step.done
                  ? <Icon name="check" size={16} color="#fff" />
                  : <span style={{ fontSize: 10, fontWeight: 700, color: step.color, fontFamily: "'DM Mono', monospace" }}>{step.number}</span>
                }
              </div>

              {/* Text + actions */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{step.title}</span>
                  {step.done && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
                      background: step.colorBg, color: step.color,
                      border: `1px solid ${step.color}44`, letterSpacing: "0.06em",
                    }}>DONE</span>
                  )}
                </div>

                <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.65, marginBottom: (step.action || step.isConnect || step.navigate) ? 12 : 0 }}>
                  {step.description}
                </div>

                {/* External link */}
                {step.action && (
                  <a href={step.action.href} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 600, color: step.color,
                    background: step.colorBg, border: `1px solid ${step.color}33`,
                    borderRadius: 8, padding: "6px 12px", textDecoration: "none",
                  }}>
                    {step.action.label}
                    <Icon name="arrow" size={12} color={step.color} />
                  </a>
                )}

                {/* Connect wallet */}
                {step.isConnect && (
                  account ? (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontSize: 12, fontWeight: 600, color: step.color,
                      background: step.colorBg, border: `1px solid ${step.color}33`,
                      borderRadius: 8, padding: "6px 12px",
                    }}>
                      <Icon name="check" size={12} color={step.color} />
                      Wallet connected
                    </div>
                  ) : (
                    <button className="btn" onClick={connect} style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      fontSize: 12, fontWeight: 600, color: "#fff",
                      background: t.accent, borderRadius: 8, padding: "6px 14px",
                    }}>
                      <Icon name="wallet" size={13} color="#fff" />
                      Connect MetaMask
                    </button>
                  )
                )}

                {/* Navigate to tab */}
                {step.navigate && (
                  <button className="btn" onClick={() => setTab(step.navigate)} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 600, color: step.color,
                    background: step.colorBg, border: `1px solid ${step.color}33`,
                    borderRadius: 8, padding: "6px 12px",
                  }}>
                    {step.navigateLabel}
                    <Icon name="arrow" size={12} color={step.color} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Issue Tab ────────────────────────────────────────────────────────────────
function IssueTab({ t, account, connect, issueCertificate, toast, theme }) {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ studentName: "", courseName: "", instituteName: "", expiryDate: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const dropRef = useRef();

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    const hash = await hashFile(f);
    setFileHash(hash);
    toast("File hashed successfully", "success");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!account) { connect(); return; }
    if (!file || !fileHash) { toast("Please upload a certificate file", "danger"); return; }
    if (!form.studentName || !form.courseName || !form.instituteName || !form.expiryDate) {
      toast("Please fill all fields", "danger"); return;
    }
    setLoading(true);
    try {
      const res = await issueCertificate({ fileHash, ...form });
      setResult(res);
      const verifyUrl = `${window.location.origin}?certId=${res.certId}`;
      const qr = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 2, color: { dark: theme === "dark" ? "#e8e8f0" : "#1a1a2e", light: "#00000000" } });
      setQrUrl(qr);
      toast("Certificate issued on blockchain!", "success");
    } catch (e) {
      toast(e.message?.slice(0, 80) || "Transaction failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      {!account && <ConnectPrompt t={t} connect={connect} />}

      {/* Drop zone */}
      <div ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
        style={{
          border: `2px dashed ${dragging ? t.accent : file ? t.success : t.border}`,
          borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer",
          background: dragging ? t.accentGlow : file ? t.successBg : t.bgCard,
          transition: "all 0.2s", marginBottom: 20,
          boxShadow: dragging ? `0 0 30px ${t.accentGlow}` : "none",
        }}>
        <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])} />
        <Icon name={file ? "check" : "upload"} size={32} color={file ? t.success : t.textMuted} />
        <div style={{ marginTop: 12, fontWeight: 500, color: file ? t.success : t.text }}>
          {file ? file.name : "Drop certificate here or click to upload"}
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF, JPG, PNG — any file format works"}
        </div>
        {fileHash && (
          <div style={{
            marginTop: 12, fontSize: 11, fontFamily: "'DM Mono', monospace",
            color: t.accent, background: t.accentGlow, borderRadius: 6, padding: "4px 10px",
            wordBreak: "break-all",
          }}>
            SHA-256: {fileHash.slice(0, 32)}…
          </div>
        )}
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {[
          { key: "studentName", label: "Student Name", placeholder: "Rahul Sharma" },
          { key: "courseName", label: "Course / Degree", placeholder: "B.Tech Computer Science" },
          { key: "instituteName", label: "Institution Name", placeholder: "IIT Bombay" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ gridColumn: key === "instituteName" ? "span 2" : "span 1" }}>
            <label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 6 }}>{label}</label>
            <input className="input" placeholder={placeholder} value={form[key]}
              onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
              style={{
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10,
                padding: "10px 14px", color: t.text, fontSize: 14,
              }} />
          </div>
        ))}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 6 }}>Expiry Date</label>
          <input className="input" type="date" value={form.expiryDate}
            onChange={(e) => setForm(f => ({ ...f, expiryDate: e.target.value }))}
            style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10,
              padding: "10px 14px", color: t.text, fontSize: 14,
            }} />
        </div>
      </div>

      <button className="btn" onClick={handleSubmit} disabled={loading || !account} style={{
        width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600,
        background: loading ? t.border : t.accent, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: !loading ? `0 0 30px ${t.accentGlow}` : "none",
        opacity: (!account || loading) ? 0.7 : 1,
      }}>
        {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Signing transaction…</> : <><Icon name="shield" size={16} color="#fff" /> Issue Certificate on Blockchain</>}
      </button>

      {/* Result */}
      {result && (
        <div className="fade-up" style={{
          marginTop: 24, background: t.successBg, border: `1px solid ${t.success}44`,
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Icon name="check" size={18} color={t.success} />
            <span style={{ fontWeight: 600, color: t.success }}>Certificate issued successfully!</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: qrUrl ? "1fr auto" : "1fr", gap: 20, alignItems: "start" }}>
            <div>
              <ResultRow t={t} label="Certificate ID" value={result.certId} mono copyable />
              <ResultRow t={t} label="Transaction Hash" value={result.txHash} mono copyable />
            </div>
            {qrUrl && (
              <div style={{ textAlign: "center" }}>
                <img src={qrUrl} alt="QR Code" style={{ width: 100, height: 100, borderRadius: 8 }} />
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Scan to verify</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Verify Tab ───────────────────────────────────────────────────────────────
function VerifyTab({ t, verifyCertificate, toast, theme }) {
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verify = async () => {
    if (mode === "file" && !file) { toast("Please upload a certificate file", "danger"); return; }
    if (mode === "id" && !certId.trim()) { toast("Please enter a Certificate ID", "danger"); return; }
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (mode === "file") {
        const hash = await hashFile(file);
        res = await verifyCertificate(hash);
        res.hash = hash;
      } else {
        const { verifyCertById } = { verifyCertById: async () => ({ found: false, cert: {} }) };
        res = { found: false };
        toast("ID-based verify requires wallet connection", "info");
        setLoading(false); return;
      }
      setResult(res);
      if (res.found) toast("Certificate verified — authentic!", "success");
      else toast("Certificate not found on blockchain", "danger");
    } catch (e) {
      toast(e.message?.slice(0, 80) || "Verification failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  const cert = result?.cert;
  const expired = cert && isExpired(cert.expiryDate);
  const revoked = cert?.revoked;
  const valid = result?.found && !expired && !revoked;

  return (
    <div className="fade-up">
      {/* Mode toggle */}
      <div style={{
        display: "flex", background: t.bgCard, border: `1px solid ${t.border}`,
        borderRadius: 12, padding: 4, marginBottom: 20, gap: 4,
      }}>
        {[["file", "Upload File", "upload"], ["id", "Certificate ID", "link"]].map(([m, label, icon]) => (
          <button key={m} className="btn" onClick={() => { setMode(m); setResult(null); }} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "9px", borderRadius: 9, fontSize: 13, fontWeight: 500,
            background: mode === m ? t.accent : "transparent",
            color: mode === m ? "#fff" : t.textMuted,
          }}>
            <Icon name={icon} size={14} color={mode === m ? "#fff" : t.textMuted} />
            {label}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <div onClick={() => document.getElementById("verifyFile").click()}
          style={{
            border: `2px dashed ${file ? t.success : t.border}`, borderRadius: 16,
            padding: "40px 24px", textAlign: "center", cursor: "pointer",
            background: file ? t.successBg : t.bgCard, transition: "all 0.2s", marginBottom: 16,
          }}>
          <input id="verifyFile" type="file" style={{ display: "none" }}
            onChange={(e) => { setFile(e.target.files[0]); setResult(null); }} />
          <Icon name={file ? "check" : "shield"} size={32} color={file ? t.success : t.textMuted} />
          <div style={{ marginTop: 12, fontWeight: 500, color: file ? t.success : t.text }}>
            {file ? file.name : "Upload the certificate to verify"}
          </div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
            Must be the exact same file that was issued
          </div>
        </div>
      ) : (
        <input className="input" placeholder="Paste Certificate ID (0x...)" value={certId}
          onChange={(e) => setCertId(e.target.value)}
          style={{
            background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12,
            padding: "14px 16px", color: t.text, fontSize: 13,
            fontFamily: "'DM Mono', monospace", marginBottom: 16,
          }} />
      )}

      <button className="btn" onClick={verify} disabled={loading} style={{
        width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600,
        background: loading ? t.border : t.accent, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: !loading ? `0 0 30px ${t.accentGlow}` : "none",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Checking blockchain…</> : <><Icon name="eye" size={16} color="#fff" /> Verify Certificate</>}
      </button>

      {/* Verification result */}
      {result && (
        <div className="fade-up" style={{
          marginTop: 24, borderRadius: 16, padding: 24, overflow: "hidden",
          background: valid ? t.successBg : t.dangerBg,
          border: `1px solid ${valid ? t.success : t.danger}44`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: valid ? 20 : 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: valid ? t.success : revoked ? t.warn : t.danger,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name={valid ? "check" : "x"} size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: valid ? t.success : t.danger }}>
                {valid ? "Certificate Verified" : revoked ? "Certificate Revoked" : expired ? "Certificate Expired" : "Certificate Not Found"}
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                {valid ? "This certificate is authentic and active" : revoked ? "This certificate was revoked by the issuer" : expired ? "This certificate has expired" : "No matching certificate found on blockchain"}
              </div>
            </div>
          </div>

          {cert && result.found && (
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              <ResultRow t={t} label="Student" value={cert.studentName} />
              <ResultRow t={t} label="Course" value={cert.courseName} />
              <ResultRow t={t} label="Institution" value={cert.instituteName} />
              <ResultRow t={t} label="Issued On" value={formatDate(cert.issueDate)} />
              <ResultRow t={t} label="Expires" value={formatDate(cert.expiryDate)} />
              <ResultRow t={t} label="Issued By" value={cert.issuedBy} mono copyable />
              <ResultRow t={t} label="Verified" value={`${cert.verifyCount?.toString() || "0"} times`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Manage Tab ───────────────────────────────────────────────────────────────
function ManageTab({ t, account, connect, getIssuerCertificates, revokeCertificate, toast }) {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(null);

  const load = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const data = await getIssuerCertificates(account);
      setCerts(data);
    } catch (e) {
      toast("Failed to load certificates", "danger");
    } finally {
      setLoading(false);
    }
  }, [account, getIssuerCertificates]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (certId) => {
    if (!window.confirm("Revoke this certificate? This cannot be undone.")) return;
    setRevoking(certId);
    try {
      await revokeCertificate(certId);
      toast("Certificate revoked", "success");
      load();
    } catch (e) {
      toast(e.message?.slice(0, 80) || "Revocation failed", "danger");
    } finally {
      setRevoking(null);
    }
  };

  if (!account) return <ConnectPrompt t={t} connect={connect} />;

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: t.textMuted }}>{certs.length} certificate{certs.length !== 1 ? "s" : ""} issued</div>
        <button className="btn" onClick={load} disabled={loading} style={{
          background: t.bgCard, border: `1px solid ${t.border}`, color: t.textMuted,
          borderRadius: 8, padding: "7px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ animation: loading ? "spin 1s linear infinite" : "none", display: "inline-block" }}>⟳</span>
          Refresh
        </button>
      </div>

      {loading && certs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: t.textMuted }}>
          <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24 }}>⟳</span>
          <div style={{ marginTop: 12 }}>Loading your certificates…</div>
        </div>
      ) : certs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16,
        }}>
          <Icon name="shield" size={40} color={t.textDim} />
          <div style={{ marginTop: 16, fontWeight: 500, color: t.textMuted }}>No certificates issued yet</div>
          <div style={{ fontSize: 13, color: t.textDim, marginTop: 6 }}>Issue your first certificate to see it here</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {certs.map((c) => {
            const expired = isExpired(c.expiryDate);
            const status = c.revoked ? "revoked" : expired ? "expired" : "active";
            const statusColors = { active: t.success, revoked: t.danger, expired: t.warn };
            const statusBg = { active: t.successBg, revoked: t.dangerBg, expired: t.warnBg };
            return (
              <div key={c.id} className="card-hover" style={{
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14,
                padding: 20, transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.studentName}</div>
                    <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>{c.courseName} · {c.instituteName}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    background: statusBg[status], color: statusColors[status],
                    border: `1px solid ${statusColors[status]}44`, textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{status}</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: t.textMuted, marginBottom: 12 }}>
                  <span>Issued: {formatDate(c.issueDate)}</span>
                  <span>Expires: {formatDate(c.expiryDate)}</span>
                  <span>Verified: {c.verifyCount?.toString() || "0"}×</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{
                    flex: 1, fontSize: 10, fontFamily: "'DM Mono', monospace",
                    color: t.accent, background: t.accentGlow, borderRadius: 6,
                    padding: "4px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{c.id}</code>
                  <button className="btn" onClick={() => { copyToClipboard(c.id); toast("Copied!", "success"); }} style={{
                    width: 30, height: 30, borderRadius: 7, background: t.bgCard,
                    border: `1px solid ${t.border}`, color: t.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="copy" size={13} />
                  </button>
                  {!c.revoked && (
                    <button className="btn" onClick={() => handleRevoke(c.id)} disabled={revoking === c.id} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 7, fontSize: 12,
                      background: t.dangerBg, border: `1px solid ${t.danger}44`, color: t.danger,
                    }}>
                      {revoking === c.id ? "…" : <><Icon name="trash" size={12} color={t.danger} /> Revoke</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function ConnectPrompt({ t, connect }) {
  return (
    <div style={{
      background: t.infoBg, border: `1px solid ${t.info}44`, borderRadius: 14,
      padding: "20px 24px", marginBottom: 24,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="info" size={18} color={t.info} />
        <span style={{ fontSize: 14, color: t.info }}>Connect your wallet to continue</span>
      </div>
      <button className="btn" onClick={connect} style={{
        background: t.accent, color: "#fff", borderRadius: 8,
        padding: "7px 16px", fontSize: 13, fontWeight: 600,
      }}>Connect</button>
    </div>
  );
}

function ResultRow({ t, label, value, mono, copyable }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 12, color: t.textMuted, flexShrink: 0, minWidth: 80 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span style={{
          fontSize: mono ? 11 : 13, fontFamily: mono ? "'DM Mono', monospace" : "inherit",
          color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</span>
        {copyable && (
          <button className="btn" onClick={handleCopy} style={{
            flexShrink: 0, width: 24, height: 24, borderRadius: 5,
            background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={copied ? "check" : "copy"} size={11} color={copied ? t.success : t.textMuted} />
          </button>
        )}
      </div>
    </div>
  );
}
