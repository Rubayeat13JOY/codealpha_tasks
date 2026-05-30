/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Brain, CheckSquare, AlertTriangle, ShieldCheck, ChevronRight, HelpCircle } from "lucide-react";
import { Project, Task } from "../types";

interface GeminiCopilotProps {
  project: Project;
  tasks: Task[];
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  { label: "Analyze Project Risks", text: "Please analyze our current roadmap and list any due date risks, blocker items, or priority leaks that require team attention." },
  { label: "Draft Action Checklist", text: "Can you generate a detailed step-by-step checklist of subtasks we should add for our remaining Review or In Progress tickets?" },
  { label: "Develop Status Review", text: "Create a formal, highly scannable project sprint status update containing completion ratios, bottleneck analysis, and recommended corrective actions." }
];

export default function GeminiCopilot({ project, tasks }: GeminiCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Hello! I am your **Gemini AI Project Copilot**. I have scanned the active board metadata for **${project.name}** (${tasks.filter(t => t.projectId === project.id).length} cards total).\n\nAsk me to summarize comment conversations, detect milestone blockers, compile roadmaps, or generate subtask checklists! Feel free to click one of the quick analysis templates below.`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const triggerCopilotQuery = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Append user message
    const updatedMessages = [...messages, { role: "user" as const, text: promptText }];
    setMessages(updatedMessages);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collab_token")}`
        },
        body: JSON.stringify({
          prompt: promptText,
          projectId: project.id
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setMessages([...updatedMessages, { role: "assistant" as const, text: data.text }]);
      } else {
        setMessages([...updatedMessages, { 
          role: "assistant" as const, 
          text: `⚠️ **Analyst Offline**: ${data.error || "Could not retrieve generation. Ensure your API secret key is configured via the Secrets panel."}` 
        }]);
      }
    } catch (err: any) {
      setMessages([...updatedMessages, { 
        role: "assistant" as const, 
        text: `❌ **Network failure**: Unable to connect with backend Gemini routing context.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    triggerCopilotQuery(inputPrompt.trim());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch h-[72vh]">
      
      {/* Sidebar macros suggestions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-150 flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">AI Skill Templates</h4>
          </div>
          
          <div className="space-y-3">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => triggerCopilotQuery(qp.text)}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 text-slate-600 transition-all text-xs flex items-start gap-2.5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-1 rounded-md bg-white border border-slate-200/80 group-hover:border-indigo-400 text-indigo-600 mt-0.5 shrink-0 transition-colors">
                  {idx === 0 && <AlertTriangle size={12} className="text-amber-500" />}
                  {idx === 1 && <CheckSquare size={12} className="text-indigo-600" />}
                  {idx === 2 && <ShieldCheck size={12} className="text-emerald-500" />}
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700 text-[10.5px] group-hover:text-indigo-600 transition-colors">{qp.label}</span>
                  <p className="text-[9.5px] leading-normal text-slate-400 line-clamp-2">{qp.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1 text-[10px] text-slate-500 leading-normal">
          <Brain size={13} className="text-indigo-600 inline mr-1" />
          <span className="font-semibold text-slate-700">Project Analysis Model</span>
          <p>These skills feed card priority, status columns, overdue schedules, and assignee workloads into the Gemini prompt automatically to guarantee precise feedback.</p>
        </div>
      </div>

      {/* Main chat log window */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
        
        {/* Banner bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Sparkles size={15} className="text-indigo-600" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800">Gemini Project Intelligence Codebase Analyst</h4>
            <p className="text-[10px] text-slate-400">Contextual answers directly generated for {project.name}</p>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[50vh]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 text-xs ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`p-2.5 rounded-full border ${msg.role === "user" ? "bg-slate-100 border-slate-200" : "bg-indigo-50 border-indigo-100"}`}>
                {msg.role === "user" ? "👤" : "✨"}
              </div>
              <div className={`max-w-[80%] p-4 rounded-xl border ${
                msg.role === "user" 
                  ? "bg-slate-50 border-slate-200 text-slate-600 rounded-tr-none" 
                  : "bg-white border-slate-120 shadow-sm text-slate-700 rounded-tl-none"
              }`}>
                {/* Parse clean text paragraphs and bold markdown tags optionally */}
                <div className="space-y-2 prose max-w-none prose-sm leading-relaxed text-xs">
                  {msg.text.split("\n").map((para, pIdx) => {
                    if (para.startsWith("### ")) {
                      return <h5 key={pIdx} className="font-bold text-slate-800 pt-1.5">{para.replace("### ", "")}</h5>;
                    }
                    if (para.startsWith("## ")) {
                      return <h4 key={pIdx} className="font-black text-slate-800 pt-2 pb-0.5 border-b border-slate-105">{para.replace("## ", "")}</h4>;
                    }
                    if (para.startsWith("- ") || para.startsWith("* ")) {
                      return <li key={pIdx} className="list-disc pl-4 text-slate-600 text-wrap leading-normal">{para.substring(2)}</li>;
                    }

                    // Simple Bold parser
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    while ((match = boldRegex.exec(para)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(para.substring(lastIndex, match.index));
                      }
                      parts.push(<strong key={match.index} className="font-bold text-slate-800">{match[1]}</strong>);
                      lastIndex = boldRegex.lastIndex;
                    }
                    if (lastIndex < para.length) {
                      parts.push(para.substring(lastIndex));
                    }

                    return <p key={pIdx} className="text-wrap leading-relaxed">{parts.length > 0 ? parts : para}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="p-2.5 rounded-full bg-indigo-50 border border-indigo-100 animate-pulse">✨</div>
              <div className="bg-slate-50 border border-slate-100 max-w-[80%] p-4 rounded-xl flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-slate-500 font-medium">Gemini is processing project schemas...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-100/80 bg-slate-50/50 flex gap-2">
          <input
            type="text"
            disabled={isLoading}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Gemini: e.g., 'Summarize active database schemas tasks'"
            className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </form>

      </div>

    </div>
  );
}
