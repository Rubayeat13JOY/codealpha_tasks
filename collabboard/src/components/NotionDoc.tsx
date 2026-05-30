/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { NotionDocument, Project } from "../types";
import { 
  FileText, Plus, Trash2, Edit3, BookOpen, Clock, 
  Check, AlertCircle, Save, Heading, Code, FileCheck 
} from "lucide-react";

interface NotionDocProps {
  project: Project;
  documents: NotionDocument[];
  onAddDocument: (title: string, content: string) => void;
  onUpdateDocument: (docId: string, updates: Partial<NotionDocument>) => void;
  onDeleteDocument: (docId: string) => void;
}

export default function NotionDoc({
  project,
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument
}: NotionDocProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocName, setNewDocName] = useState("");

  const projectDocs = documents.filter((d) => d.projectId === project.id);
  const activeDoc = projectDocs.find((d) => d.id === selectedDocId) || projectDocs[0];

  // Set default document if available
  useEffect(() => {
    if (projectDocs.length > 0 && !selectedDocId) {
      setSelectedDocId(projectDocs[0].id);
    }
  }, [projectDocs, selectedDocId]);

  // Load editor state when document changes
  useEffect(() => {
    if (activeDoc) {
      setEditTitle(activeDoc.title);
      setEditContent(activeDoc.content);
    }
  }, [activeDoc]);

  // Autosave setup (Debounced 1.5s typing buffer)
  useEffect(() => {
    if (!activeDoc || !isEditing) return;
    
    // Check if anything actually modified
    if (editTitle === activeDoc.title && editContent === activeDoc.content) {
      return;
    }

    setSaveStatus("saving");
    const saveTimer = setTimeout(() => {
      onUpdateDocument(activeDoc.id, {
        title: editTitle,
        content: editContent
      });
      setSaveStatus("saved");
      const clearSaved = setTimeout(() => setSaveStatus("idle"), 1500);
      return () => clearTimeout(clearSaved);
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [editTitle, editContent, isEditing, activeDoc]);

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    onAddDocument(
      newDocName.trim(),
      `# ${newDocName.trim()}\n\nWrite clear team specs, requirements outline, or meeting minutes here...\n\n### Milestones\n- [ ] Blueprint specification list\n- [ ] Database validation tables`
    );
    setNewDocName("");
    setShowCreateForm(false);
  };

  const handleDelete = (docId: string) => {
    if (window.confirm("Are you sure you want to delete this document page?")) {
      onDeleteDocument(docId);
      setSelectedDocId("");
    }
  };

  const appendMarkdownTemplate = (snippet: string) => {
    setEditContent((prev) => prev + "\n" + snippet);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch h-[72vh]">
      
      {/* Pages list panel sidebar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Pages Index</h4>
            <button
              onClick={() => setShowCreateForm(true)}
              className="p-1 px-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> New
            </button>
          </div>

          {/* New Page input form inline toggle */}
          {showCreateForm && (
            <form onSubmit={handleCreateDocument} className="p-2 border border-slate-100 bg-slate-50 rounded-xl space-y-2">
              <input
                type="text"
                required
                placeholder="Page Title..."
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-2 py-1 text-[10px] text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Map documents list */}
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {projectDocs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No workspace pages authored yet.</p>
            ) : (
              projectDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    (selectedDocId === doc.id || (!selectedDocId && projectDocs[0]?.id === doc.id))
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-50"
                      : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-100/50"
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsEditing(false);
                    }}
                    className="flex-1 text-left flex items-center gap-2 truncate text-xs font-semibold cursor-pointer"
                  >
                    <FileText size={13} className={(selectedDocId === doc.id || (!selectedDocId && projectDocs[0]?.id === doc.id)) ? "text-white" : "text-indigo-600"} />
                    <span className="truncate">{doc.title}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all cursor-pointer ${
                      (selectedDocId === doc.id || (!selectedDocId && projectDocs[0]?.id === doc.id))
                        ? "text-indigo-200 hover:text-white"
                        : "text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tip section */}
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] text-slate-500 space-y-1 leading-normal">
          <BookOpen size={13} className="text-indigo-600 inline mr-1" />
          <span className="font-semibold text-slate-700">Autosave Workspace</span>
          <p>This editor syncs comments & page outlines in the background as you type. Real-time changes broadcast to group immediately.</p>
        </div>

      </div>

      {/* Editor Main Canvas */}
      {activeDoc ? (
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between overflow-hidden">
          
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Title toolbar status */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-base font-bold text-slate-800 border-none px-0 py-0.5 focus:ring-0 focus:outline-none border-b border-indigo-500 max-w-sm"
                  />
                ) : (
                  <h3 className="text-base font-bold text-slate-800">{activeDoc.title}</h3>
                )}
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 px-2 rounded-lg border transition-all text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                    isEditing 
                      ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                      : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100"
                  }`}
                >
                  <Edit3 size={11} />
                  {isEditing ? "Viewing Mode" : "Edit Workspace"}
                </button>
              </div>

              {/* SSE save notifier indicator */}
              <div className="flex items-center gap-3 text-[10px] font-mono font-medium text-slate-400">
                {saveStatus === "saving" && (
                  <span className="text-amber-500 flex items-center gap-1">
                    <Save size={11} className="animate-spin" /> Saving changes...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <Check size={11} /> Content Autosaved
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Edit by {activeDoc.lastEditedByName} at {new Date(activeDoc.lastEditedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Markdown helper macros (only during edits) */}
            {isEditing && (
              <div className="flex flex-wrap gap-2 py-1.5 border-b border-slate-100">
                <button
                  onClick={() => appendMarkdownTemplate("### New Section Title")}
                  className="p-1 px-2 border border-slate-200 rounded text-[10px] hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Heading size={10} /> Header
                </button>
                <button
                  onClick={() => appendMarkdownTemplate("- [ ] Milestone checkpoint")}
                  className="p-1 px-2 border border-slate-200 rounded text-[10px] hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck size={10} /> Checkbox
                </button>
                <button
                  onClick={() => appendMarkdownTemplate("\`\`\`typescript\n// code snippet\n\`\`\`")}
                  className="p-1 px-2 border border-slate-200 rounded text-[10px] hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Code size={10} /> Codeblock
                </button>
              </div>
            )}

            {/* Real Textareas / Viewer */}
            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Draft requirements, code guidelines, or launch specifications..."
                  className="w-full h-full text-xs p-1 font-mono leading-relaxed border-0 focus:ring-0 focus:outline-none resize-none"
                />
              ) : (
                <div className="prose text-xs text-slate-600 leading-relaxed space-y-3.5 max-w-none pr-1">
                  {activeDoc.content.split("\n").map((line, idx) => {
                    if (line.startsWith("## ")) {
                      return <h2 key={idx} className="text-sm font-bold text-slate-800 pt-3 pb-1 border-b border-slate-100">{line.replace("## ", "")}</h2>;
                    }
                    if (line.startsWith("### ")) {
                      return <h3 key={idx} className="text-xs font-semibold text-slate-800 pt-2 pb-0.5">{line.replace("### ", "")}</h3>;
                    }
                    if (line.startsWith("# ")) {
                      return <h1 key={idx} className="text-base font-black text-slate-800 pb-2 border-b border-slate-200">{line.replace("# ", "")}</h1>;
                    }
                    if (line.startsWith("- [ ] ")) {
                      return (
                        <div key={idx} className="flex items-center gap-2 font-mono font-medium pl-1 text-[11px]">
                          <input type="checkbox" disabled className="w-3.5 h-3.5 border-slate-200 text-indigo-500 rounded cursor-not-allowed" />
                          <span>{line.replace("- [ ] ", "")}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("- [x] ")) {
                      return (
                        <div key={idx} className="flex items-center gap-2 font-mono font-medium pl-1 text-[11px]">
                          <input type="checkbox" disabled checked className="w-3.5 h-3.5 border-slate-200 text-indigo-500 rounded cursor-not-allowed" />
                          <span className="line-through text-slate-400">{line.replace("- [x] ", "")}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("* ") || line.startsWith("- ")) {
                      return <li key={idx} className="list-disc pl-4 text-slate-600">{line.substring(2)}</li>;
                    }
                    if (!line.trim()) return <div key={idx} className="h-2" />;
                    return <p key={idx} className="text-wrap leading-relaxed">{line}</p>;
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <BookOpen size={24} className="text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 italic">Auth or pick a document page index on are sidebar</p>
        </div>
      )}

    </div>
  );
}
