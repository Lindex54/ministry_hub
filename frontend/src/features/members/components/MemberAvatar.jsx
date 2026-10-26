import { getMemberInitials } from "../data/members.mock";
import { cn } from "@/lib/utils";

export function MemberAvatar({ member, className }) {
  return member.profilePhoto ? (
    <img
      src={member.profilePhoto}
      alt={`${member.firstName} ${member.lastName}`}
      className={cn("size-10 rounded-full object-cover ring-2 ring-background", className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn("flex size-10 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary ring-2 ring-background", className)}
    >
      {getMemberInitials(member)}
    </span>
  );
}
