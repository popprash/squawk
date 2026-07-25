import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";
import { formatMessageTime } from "../../lib/utils";
import { ImageIcon, VideoIcon } from "lucide-react";

export function ConversationRow({ user, selected, onSelect }) {
  const formatLastMessagePreview = () => {
    if (user.lastMessageImage) {
      return (
        <span className="flex items-center gap-1 text-muted text-xs">
          <ImageIcon className="size-3.5" /> Photo
        </span>
      );
    }
    if (user.lastMessageVideo) {
      return (
        <span className="flex items-center gap-1 text-muted text-xs">
          <VideoIcon className="size-3.5" /> Video
        </span>
      );
    }
    return user.lastMessageText || "";
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-surface/50 cursor-pointer ${
        selected ? "bg-accent-soft" : ""
      }`}
    >
      <AvatarWithOnlineIndicator isOnline={user.isOnline ?? true}>
        <Avatar className="size-12 shrink-0">
          <Avatar.Image alt={user.name} src={user.avatarUrl} />
          <Avatar.Fallback className="text-sm font-medium">{user.initials}</Avatar.Fallback>
        </Avatar>
      </AvatarWithOnlineIndicator>

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <p className="truncate text-[15px] font-semibold text-foreground">{user.name}</p>
          {user.lastMessageAt ? (
            <span className="text-[11px] text-muted shrink-0 ml-2">
              {formatMessageTime(user.lastMessageAt)}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="truncate text-[13px] text-muted flex-1 pr-2">
            {formatLastMessagePreview()}
          </p>
          {user.unreadCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-success text-[10px] font-bold text-success-foreground shrink-0 animate-pulse">
              {user.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}