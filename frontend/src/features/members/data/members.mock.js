export const membershipStatuses = ["Active", "Inactive", "Transferred"];

export function getMemberDisplayName(member) {
  return member.preferredName
    ? `${member.preferredName} ${member.lastName}`
    : `${member.firstName} ${member.lastName}`;
}

export function getMemberInitials(member) {
  return `${member.firstName?.[0] ?? ""}${member.lastName?.[0] ?? ""}`.toUpperCase();
}
