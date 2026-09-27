"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Clock3, Gift, Video } from "lucide-react";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  type: "INTERVIEW" | "DEADLINE" | "DRIVE" | "JOINING";
  href: string;
  time?: string;
};

const labels: Record<CalendarEvent["type"], string> = { INTERVIEW: "Interviews", DEADLINE: "Deadlines", DRIVE: "Drive dates", JOINING: "Joining dates" };
const icons = { INTERVIEW: Video, DEADLINE: Clock3, DRIVE: BriefcaseBusiness, JOINING: Gift };

export default function PlacementCalendar({ events }: { events: CalendarEvent[] }) {
  const [filter, setFilter] = useState<"ALL" | CalendarEvent["type"]>("ALL");
  const filtered = useMemo(() => filter === "ALL" ? events : events.filter(e => e.type === filter), [events, filter]);
  const groups = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filtered.forEach(event => map.set(event.date, [...(map.get(event.date) || []), event]));
    return [...map.entries()];
  }, [filtered]);

  return <section className="calendar-shell">
    <div className="calendar-toolbar panel">
      <div><p className="eyebrow">PLACEMENT CALENDAR</p><h2>Upcoming placement events</h2><p>Interviews, application deadlines, drive dates and joining milestones in one timeline.</p></div>
      <div className="calendar-filters" role="tablist" aria-label="Calendar filters">
        <button className={filter === "ALL" ? "active" : ""} onClick={() => setFilter("ALL")}>All</button>
        {(Object.keys(labels) as CalendarEvent["type"][]).map(type => <button key={type} className={filter === type ? "active" : ""} onClick={() => setFilter(type)}>{labels[type]}</button>)}
      </div>
    </div>
    {!groups.length ? <div className="panel calendar-empty"><CalendarDays size={24}/><h2>No events found</h2><p>Placement events will appear here as drives, interviews and offers are scheduled.</p><Link className="primary" href="/opportunities">Explore opportunities <ArrowUpRight size={15}/></Link></div> :
      <div className="calendar-timeline">{groups.map(([date, dayEvents]) => { const day = new Date(date + "T00:00:00"); return <section className="calendar-day panel" key={date}>
        <div className="calendar-day-heading"><div className="calendar-date-badge"><b>{day.toLocaleDateString("en-IN", { day: "2-digit" })}</b><span>{day.toLocaleDateString("en-IN", { month: "short" })}</span></div><div><p className="eyebrow">{day.toLocaleDateString("en-IN", { weekday: "long" }).toUpperCase()}</p><h3>{day.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</h3></div></div>
        <div className="calendar-events">{dayEvents.map(event => { const Icon = icons[event.type]; return <article className="calendar-event" key={event.id}><div className={`calendar-event-icon ${event.type.toLowerCase()}`}><Icon size={17}/></div><div className="calendar-event-copy"><span className="calendar-event-type">{labels[event.type]}</span><h4>{event.title}</h4><p>{event.subtitle}</p>{event.time && <small>{event.time}</small>}</div><Link className="icon-action" href={event.href} aria-label={`Open ${event.title}`}><ArrowUpRight size={15}/></Link></article>; })}</div>
      </section>; })}</div>}
  </section>;
}
