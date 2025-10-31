import { createContext, useState, ReactNode } from "react";

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;
}

export const ChatContext = createContext<ChatContextType>({
  isChatOpen: false,
  setIsChatOpen: () => {},
  toggleChat: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, setIsChatOpen, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
};
