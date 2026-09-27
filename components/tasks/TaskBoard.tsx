"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import ActionFeedback from "@/components/ui/ActionFeedback";

type Task = { id: string; title: string; description: string | null; dueDate: string | null; priority: string; status: string };

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const open = useMemo(() => tasks.filter(t => t.status !== "DONE"), [tasks]);
  const done = useMemo(() => tasks.filter(t => t.status === "DONE"), [tasks]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setFeedback(null);
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, dueDate: dueDate || null, priority }) });
    if (res.ok) { const task = await res.json(); setTasks(prev => [task, ...prev]); setTitle(""); setDueDate(""); setPriority("MEDIUM"); setFeedback({ type: "success", message: "Task added" }); }
    else setFeedback({ type: "error", message: "Could not add task" });
    setSaving(false);
  }

  async function toggle(task: Task) {
    const status = task.status === "DONE" ? "TODO" : "DONE";
    setFeedback(null);
    const res = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
    else setFeedback({ type: "error", message: "Could not update task" });
  }

  async function remove(id: string) {
    setFeedback(null);
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id));
    else setFeedback({ type: "error", message: "Could not delete task" });
  }

  const list = (items: Task[]) => items.map(task => (
    <article className="task-row" key={task.id}>
      <button className={`task-check ${task.status === "DONE" ? "done" : ""}`} onClick={() => toggle(task)} aria-label={`Mark ${task.title} ${task.status === "DONE" ? "open" : "done"}`}><Check size={15}/></button>
      <div className="task-copy"><b className={task.status === "DONE" ? "task-done" : ""}>{task.title}</b>{task.description && <small>{task.description}</small>}<div className="task-meta"><span className={`task-priority ${task.priority.toLowerCase()}`}>{task.priority}</span>{task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>}</div></div>
      <button className="icon-action" onClick={() => remove(task.id)} aria-label={`Delete ${task.title}`}><Trash2 size={15}/></button>
    </article>
  ));

  return <div className="task-board">
    <form className="panel task-form" onSubmit={addTask}><div><p className="eyebrow">ADD TASK</p><h2>Plan your next placement action</h2></div><div className="task-form-grid"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Update resume for product roles" maxLength={120}/><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}/><select value={priority} onChange={e => setPriority(e.target.value)}><option value="LOW">Low priority</option><option value="MEDIUM">Medium priority</option><option value="HIGH">High priority</option></select><button className="primary" disabled={saving || !title.trim()}><Plus size={16}/> {saving ? "Adding…" : "Add task"}</button></div>{feedback && <ActionFeedback status={feedback.type} message={feedback.message} />}</form>
    <div className="task-columns"><section className="panel"><div className="section-heading"><div><p className="eyebrow">OPEN</p><h2>Next actions <span>{open.length}</span></h2></div></div>{open.length ? list(open) : <div className="task-empty"><Check size={20}/><p>You're all caught up. Add a task when you have another placement action.</p></div>}</section><section className="panel"><div className="section-heading"><div><p className="eyebrow">COMPLETED</p><h2>Done <span>{done.length}</span></h2></div></div>{done.length ? list(done) : <div className="task-empty"><p>Completed tasks will appear here.</p></div>}</section></div>
  </div>;
}
