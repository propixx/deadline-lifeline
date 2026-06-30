import crypto from "node:crypto";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toIcsDate(value) {
  const date = new Date(value);
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z"
  ].join("");
}

function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildCalendarLink(block) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: block.title,
    dates: `${toIcsDate(block.start)}/${toIcsDate(block.end)}`,
    details: block.reason || "Scheduled by Deadline Lifeline",
    location: "Deadline Lifeline"
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs(block) {
  const uid = `${block.id || crypto.randomUUID()}@deadline-lifeline`;
  const now = toIcsDate(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Deadline Lifeline//Rescue Planner//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDate(block.start)}`,
    `DTEND:${toIcsDate(block.end)}`,
    `SUMMARY:${escapeIcsText(block.title)}`,
    `DESCRIPTION:${escapeIcsText(block.reason || "Scheduled by Deadline Lifeline")}`,
    "LOCATION:Deadline Lifeline",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}
