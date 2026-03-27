"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox, CheckCircle, XCircle, Send, ExternalLink, Trash2,
  Sun, Moon, Terminal, ChevronDown, ChevronUp, Plus, Image,
  Edit3, ArrowRight, RotateCcw, MessageSquare,
} from "lucide-react";
import {
  AI_SOURCES, TARGET_PLATFORMS, type ContentItem, type ContentStatus, createItem,
} from "@/lib/data";

type Tab = "inbox" | "approved" | "sent" | "rejected" | "add";

const STORAGE_KEY = "cc-items-v1";
const now = () => new Date().toISOString().split("T")[0];

function StatusBadge({ status }: { status: ContentStatus }) {
  const map: Record<ContentStatus, { bg: string; text: string; label: string }> = {
    inbox: { bg: "bg-blue-500/20", text: "text-blue-400", label: "INBOX" },
    approved: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "APPROVED" },
    rejected: { bg: "bg-red-500/20", text: "text-red-400", label: "REJECTED" },
    sent: { bg: "bg-violet-500/20", text: "text-violet-400", label: "SENT" },
  };
  const s = map[status];
  return <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
}

export default function CommandCenter() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState<Tab>("inbox");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add form
  const [addTitle, setAddTitle] = useState("");
  const [addBody, setAddBody] = useState("");
  const [addSource, setAddSource] = useState("");
  const [addImage, setAddImage] = useState("");
  const [addTags, setAddTags] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const update = (id: string, changes: Partial<ContentItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));

  const approve = (id: string) => update(id, { status: "approved", approvedAt: now() });
  const reject = (id: string) => update(id, { status: "rejected" });
  const markSent = (id: string) => update(id, { status: "sent", sentAt: now() });
  const backToInbox = (id: string) => update(id, { status: "inbox", approvedAt: "", sentAt: "" });
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const addItem = () => {
    if (!addTitle.trim() || !addSource) return;
    const item = createItem({
      title: addTitle.trim(),
      body: addBody.trim(),
      source: addSource,
      imageUrl: addImage.trim(),
      tags: addTags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setItems(prev => [item, ...prev]);
    setAddTitle(""); setAddBody(""); setAddSource(""); setAddImage(""); setAddTags("");
    setTab("inbox");
  };

  const filtered = items.filter(i => {
    if (tab === "add") return false;
    return i.status === tab;
  });

  const counts: Record<string, number> = {
    inbox: items.filter(i => i.status === "inbox").length,
    approved: items.filter(i => i.status === "approved").length,
    sent: items.filter(i => i.status === "sent").length,
    rejected: items.filter(i => i.status === "rejected").length,
  };

  // Styles
  const bg = dark ? "bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900";
  const card = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const sub = dark ? "text-slate-400" : "text-slate-500";
  const input = dark ? "bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-600" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";
  const tabBase = "px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap";
  const tabOn = "bg-blue-600 text-white";
  const tabOff = dark ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-white text-slate-500 border border-slate-200";

  const TABS: { key: Tab; label: string; Icon: typeof Inbox; count?: number }[] = [
    { key: "inbox", label: "Inbox", Icon: Inbox, count: counts.inbox },
    { key: "approved", label: "Ready", Icon: CheckCircle, count: counts.approved },
    { key: "sent", label: "Sent", Icon: Send, count: counts.sent },
    { key: "rejected", label: "Rejected", Icon: XCircle, count: counts.rejected },
    { key: "add", label: "Add Content", Icon: Plus },
  ];

  return (
    <div className={`min-h-screen font-sans transition-all duration-500 ${bg} selection:bg-blue-500/30`}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-3 rounded-2xl shrink-0 ${dark ? "bg-blue-600/20 border border-blue-500/30" : "bg-blue-50 border border-blue-200"}`}>
              <Terminal size={22} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase">Command Center</h1>
              <p className={`text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase ${sub}`}>
                {counts.inbox} pending &middot; {counts.approved} ready &middot; {items.length} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick AI links */}
            <div className="hidden sm:flex items-center gap-1">
              {AI_SOURCES.map(s => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
                  className={`p-1.5 rounded-lg transition-all hover:scale-110 ${dark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
                  <span style={{ color: s.color }} className="text-sm">{s.icon}</span>
                </a>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} className={`p-2 rounded-xl shrink-0 ${dark ? "bg-slate-900 text-yellow-400 border border-slate-800" : "bg-white text-slate-600 border border-slate-200"}`}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* AI SOURCE BAR (mobile) */}
        <div className="flex sm:hidden gap-2 overflow-x-auto -mx-3 px-3">
          {AI_SOURCES.map(s => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border shrink-0 ${card}`}>
              <span style={{ color: s.color }} className="text-sm">{s.icon}</span>
              <span className="text-[10px] font-bold">{s.label}</span>
            </a>
          ))}
        </div>

        {/* TAB BAR */}
        <nav className="flex gap-1.5 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`${tabBase} ${tab === t.key ? tabOn : tabOff}`}>
              <t.Icon size={14} /> {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] ${tab === t.key ? "bg-white/20" : "bg-blue-500/20 text-blue-400"}`}>{t.count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* ════════ ADD CONTENT ════════ */}
        {tab === "add" && (
          <div className={`p-5 rounded-2xl border ${card}`}>
            <h3 className="text-sm font-black uppercase tracking-wider mb-4">Add AI-Generated Content</h3>
            <p className={`text-xs mb-4 ${sub}`}>Paste content from Gemini, Perplexity, Opus, Manus, or Grok. It lands in your inbox for review.</p>
            <div className="space-y-3">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>AI Source</label>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {AI_SOURCES.map(s => (
                    <button key={s.id} onClick={() => setAddSource(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                        addSource === s.id ? "border-blue-500 bg-blue-500/10 text-blue-400" : card
                      }`}>
                      <span style={{ color: s.color }}>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>Title / Headline</label>
                <input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Post title..."
                  className={`w-full mt-1 px-3 py-2.5 rounded-xl border text-sm ${input}`} />
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>Content</label>
                <textarea value={addBody} onChange={e => setAddBody(e.target.value)} placeholder="Paste the full post content..."
                  rows={8} className={`w-full mt-1 px-3 py-2.5 rounded-xl border text-sm resize-y ${input}`} />
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>Image URL (optional)</label>
                <input value={addImage} onChange={e => setAddImage(e.target.value)} placeholder="https://... or local path"
                  className={`w-full mt-1 px-3 py-2.5 rounded-xl border text-sm ${input}`} />
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider ${sub}`}>Tags (comma separated)</label>
                <input value={addTags} onChange={e => setAddTags(e.target.value)} placeholder="#forthekids, #youandinotai"
                  className={`w-full mt-1 px-3 py-2.5 rounded-xl border text-sm ${input}`} />
              </div>

              <div className={`p-3 rounded-xl ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase ${sub} mb-2`}>Targets: All {TARGET_PLATFORMS.length} platforms</p>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_PLATFORMS.map(p => (
                    <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                      <span style={{ color: p.color }}>{p.icon}</span> {p.label}
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={addItem} disabled={!addTitle.trim() || !addSource}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold transition-all active:scale-[0.98]">
                Add to Inbox
              </button>
            </div>
          </div>
        )}

        {/* ════════ CONTENT LIST ════════ */}
        {tab !== "add" && (
          <>
            {filtered.length === 0 ? (
              <div className={`text-center py-16 ${sub}`}>
                <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold">
                  {tab === "inbox" ? "Inbox empty" : tab === "approved" ? "Nothing approved yet" : tab === "sent" ? "Nothing sent yet" : "Nothing rejected"}
                </p>
                <p className="text-xs mt-1">
                  {tab === "inbox" ? "Add content from your AI team to get started" : "Content will appear here as you process it"}
                </p>
                {tab === "inbox" && (
                  <button onClick={() => setTab("add")} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500">
                    <Plus size={14} className="inline mr-1" /> Add Content
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(item => {
                  const source = AI_SOURCES.find(s => s.id === item.source);
                  const isExpanded = expandedId === item.id;

                  return (
                    <div key={item.id} className={`rounded-2xl border overflow-hidden ${card}`}>
                      {/* Header row */}
                      <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="w-full p-4 text-left">
                        <div className="flex items-start gap-3">
                          {/* Source icon */}
                          <div className="shrink-0 mt-0.5">
                            <span className="text-xl" style={{ color: source?.color }}>{source?.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <StatusBadge status={item.status} />
                              <span className={`text-[9px] ${sub}`}>{source?.label} &middot; {item.created}</span>
                            </div>
                            <p className="text-sm font-bold">{item.title}</p>
                            {!isExpanded && item.body && (
                              <p className={`text-xs mt-1 ${sub} line-clamp-1`}>{item.body}</p>
                            )}
                          </div>
                          {item.imageUrl && <Image size={16} className={`shrink-0 mt-1 ${sub}`} />}
                          {isExpanded ? <ChevronUp size={16} className={sub} /> : <ChevronDown size={16} className={sub} />}
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3">
                          {/* Body */}
                          {item.body && (
                            <div className={`p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
                              {item.body}
                            </div>
                          )}

                          {/* Image */}
                          {item.imageUrl && (
                            <div className={`p-3 rounded-xl ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
                              <p className={`text-[10px] font-bold ${sub} mb-1`}>Image</p>
                              <p className="text-xs break-all">{item.imageUrl}</p>
                            </div>
                          )}

                          {/* Tags */}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.map(t => (
                                <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>{t}</span>
                              ))}
                            </div>
                          )}

                          {/* Target platforms */}
                          <div>
                            <p className={`text-[10px] font-bold uppercase ${sub} mb-1.5`}>Posts to:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.targets.map(tid => {
                                const p = TARGET_PLATFORMS.find(tp => tp.id === tid);
                                if (!p) return null;
                                return (
                                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                                    className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all hover:scale-105 ${card}`}>
                                    <span style={{ color: p.color }}>{p.icon}</span>
                                    <span className="font-bold">{p.label}</span>
                                    <ExternalLink size={9} className={sub} />
                                  </a>
                                );
                              })}
                            </div>
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <div className={`p-3 rounded-xl border-l-2 border-amber-500 ${dark ? "bg-amber-500/5" : "bg-amber-50"}`}>
                              <p className="text-[10px] font-bold text-amber-500 mb-1">YOUR NOTES</p>
                              <p className="text-xs">{item.notes}</p>
                            </div>
                          )}

                          {/* ACTION BUTTONS */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                            {item.status === "inbox" && (
                              <>
                                <button onClick={() => approve(item.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-95">
                                  <CheckCircle size={14} /> Approve
                                </button>
                                <button onClick={() => reject(item.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold active:scale-95">
                                  <XCircle size={14} /> Reject
                                </button>
                              </>
                            )}
                            {item.status === "approved" && (
                              <>
                                <button onClick={() => markSent(item.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold active:scale-95">
                                  <Send size={14} /> Mark Sent
                                </button>
                                {/* Open all platforms */}
                                <button onClick={() => item.targets.forEach(tid => {
                                  const p = TARGET_PLATFORMS.find(tp => tp.id === tid);
                                  if (p) window.open(p.url, "_blank");
                                })} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold active:scale-95">
                                  <ArrowRight size={14} /> Open All Platforms
                                </button>
                              </>
                            )}
                            {(item.status === "rejected" || item.status === "sent") && (
                              <button onClick={() => backToInbox(item.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                                <RotateCcw size={14} /> Back to Inbox
                              </button>
                            )}
                            <button onClick={() => remove(item.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500/60 hover:text-red-500 ml-auto active:scale-95">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <footer className={`py-6 border-t text-center text-[9px] font-bold uppercase tracking-[0.2em] ${dark ? "border-slate-800 text-slate-600" : "border-slate-200 text-slate-400"}`}>
          ANTIGRAVITY Command Center &middot; Private Admin &middot; #ForTheKids
        </footer>
      </div>
    </div>
  );
}
