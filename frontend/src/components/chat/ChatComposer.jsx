import { Button, TextArea } from "@heroui/react";
import { ImageIcon, LoaderIcon, SendHorizontalIcon, X, Plus, Video } from "lucide-react";
import { useRef, useState } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";

export function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const { activeConversationId } = useSelectedConversation();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);

  const [pendingMedia, setPendingMedia] = useState(null);
  const [caption, setCaption] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleSend = async () => {
    const didSendMessage = await sendTextMessage(activeConversationId);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleComposerTextChange = (event) => {
    setComposerText(event.target.value);
    playSoundIfEnabled();
  };

  const handleMediaPick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPendingMedia({
      file,
      type: file.type.startsWith("video/") ? "video" : "image",
      previewUrl: URL.createObjectURL(file),
    });
  };

  const triggerFileSelect = (acceptType) => {
    setIsAttachmentMenuOpen(false);
    if (mediaInputRef.current) {
      mediaInputRef.current.accept = acceptType;
      mediaInputRef.current.click();
    }
  };

  const handleSendMedia = async () => {
    if (!pendingMedia) return;
    const media = pendingMedia;
    const mediaCaption = caption;

    setPendingMedia(null);
    setCaption("");

    const didSendMessage = await sendMediaMessage({
      conversationId: activeConversationId,
      file: media.file,
      caption: mediaCaption,
    });

    URL.revokeObjectURL(media.previewUrl);
    if (didSendMessage) playSoundIfEnabled();
  };

  const handleCancelMedia = () => {
    if (!pendingMedia) return;
    URL.revokeObjectURL(pendingMedia.previewUrl);
    setPendingMedia(null);
    setCaption("");
  };

  return (
    <footer className="shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2">
      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon
            className="size-4 shrink-0 animate-spin text-accent"
            strokeWidth={2}
            aria-hidden
          />
          <span className="truncate">Uploading media...</span>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />

        <div className="relative flex shrink-0 items-center justify-center self-end">
          <Button
            variant="ghost"
            isIconOnly
            isDisabled={isSendingMedia}
            className={`size-9 rounded-full shrink-0 touch-manipulation text-accent transition-transform duration-200 cursor-pointer ${
              isAttachmentMenuOpen ? "rotate-45" : ""
            }`}
            onPress={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Button>

          {isAttachmentMenuOpen ? (
            <>
              {/* Backdrop click listener to close menu */}
              <div
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setIsAttachmentMenuOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute bottom-11 left-0 z-30 min-w-40 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur-md flex flex-col gap-0.5 animate-in slide-in-from-bottom-2 duration-200">
                <button
                  type="button"
                  onClick={() => triggerFileSelect("image/*")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-foreground hover:bg-accent-soft transition-colors cursor-pointer"
                >
                  <ImageIcon className="size-4.5 text-accent" strokeWidth={2} />
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => triggerFileSelect("video/*")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium text-foreground hover:bg-accent-soft transition-colors cursor-pointer"
                >
                  <Video className="size-4.5 text-accent" strokeWidth={2} />
                  Upload Video
                </button>
              </div>
            </>
          ) : null}
        </div>

        <TextArea
          fullWidth
          variant="secondary"
          placeholder="iMessage"
          rows={1}
          value={composerText}
          onChange={handleComposerTextChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-full"
        />

        <Button variant="primary" isIconOnly isDisabled={!composerText.trim()} onPress={handleSend}>
          <SendHorizontalIcon className="size-5" />
        </Button>
      </div>

      {pendingMedia ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950/95 p-4 text-foreground md:p-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-lg font-semibold tracking-tight text-white">Preview Media</h3>
            <button
              onClick={handleCancelMedia}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Media Preview Box */}
          <div className="flex-1 flex items-center justify-center py-6 overflow-hidden">
            {pendingMedia.type === "image" ? (
              <img
                src={pendingMedia.previewUrl}
                alt="Upload Preview"
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl border border-zinc-800"
              />
            ) : (
              <video
                src={pendingMedia.previewUrl}
                controls
                className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl border border-zinc-800"
              />
            )}
          </div>

          {/* Caption & Controls Input */}
          <div className="mx-auto w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-end gap-2.5 shadow-2xl">
            <TextArea
              fullWidth
              variant="secondary"
              placeholder="Add a caption..."
              rows={1}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMedia();
                }
              }}
              className="flex-1"
            />
            <Button
              variant="primary"
              isIconOnly
              onPress={handleSendMedia}
              className="size-10 self-end rounded-full bg-accent text-accent-foreground shrink-0 cursor-pointer"
            >
              <SendHorizontalIcon className="size-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </footer>
  );
}