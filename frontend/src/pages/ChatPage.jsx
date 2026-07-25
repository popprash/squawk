import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";
import { X } from "lucide-react";

function ChatPage() {
  const { frameStyle } = useWallpaper();

  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);
  const socket = useAuthStore((state) => state.socket);

  const activeLightboxMedia = useChatStore((state) => state.activeLightboxMedia);
  const setLightboxMedia = useChatStore((state) => state.setLightboxMedia);
  const isChatFullscreen = useChatStore((state) => state.isChatFullscreen);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getUsers();
    getConversations();
  }, [getConversations, getUsers]);

  useEffect(() => {
    if (!socket) return;

    subscribeToMessages();

    // cleanup
    return () => unsubscribeFromMessages();
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (!activeConversationId) return;

    getMessages(activeConversationId);
  }, [getMessages, activeConversationId]);

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden transition-[padding] duration-300 ${
        isChatFullscreen ? "p-0" : "p-2 sm:p-3 md:p-8"
      }`}
      style={frameStyle}
    >
      <div
        className={`mx-auto flex w-full flex-1 overflow-hidden bg-background text-foreground relative transition-all duration-300 ${
          isChatFullscreen
            ? "max-w-none rounded-none border-none"
            : "max-w-6xl rounded-2xl border border-border"
        }`}
      >
        <ChatSidebar />

        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatHeader />
          <MessageList />

          {activeConversation ? <ChatComposer /> : null}
        </div>
      </div>

      {activeLightboxMedia ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setLightboxMedia(null)}
        >
          <button
            onClick={() => setLightboxMedia(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close fullscreen"
          >
            <X className="size-6" />
          </button>
          <div
            className="max-w-[95vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {activeLightboxMedia.type === "image" ? (
              <img
                src={activeLightboxMedia.url}
                alt=""
                className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200"
              />
            ) : (
              <video
                src={activeLightboxMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default ChatPage;