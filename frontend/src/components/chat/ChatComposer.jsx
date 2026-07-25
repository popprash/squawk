import { Button, TextArea } from "@heroui/react";
import { ImageIcon, LoaderIcon, SendHorizontalIcon, X } from "lucide-react";
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
          accept="image/*,video/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          className="size-9 shrink-0 touch-manipulation self-end text-accent"
          onPress={() => mediaInputRef.current?.click()}
        >
          <ImageIcon className="size-5 sm:size-6" strokeWidth={2} />
        </Button>
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