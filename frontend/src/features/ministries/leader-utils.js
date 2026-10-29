import { workers } from "@/features/outreach/data/outreach.mock";

export function resolveLeaderName(key, members) {
  if (!key) return "";
  const [type, id] = key.split(":");
  if (type === "member") {
    const member = members.find((item) => item.id === id);
    return member ? `${member.firstName} ${member.lastName}` : "";
  }
  if (type === "worker") return workers.find((item) => item.id === id)?.name ?? "";
  return "";
}

export function leaderOptions(members) {
  return [
    ...members.map((member) => ({ value: `member:${member.id}`, label: `${member.firstName} ${member.lastName} · Member` })),
    ...workers.map((worker) => ({ value: `worker:${worker.id}`, label: `${worker.name} · ${worker.role}` })),
  ];
}

export function resolveMemberName(id, members) {
  const member = members.find((item) => item.id === id);
  return member ? `${member.firstName} ${member.lastName}` : "";
}
