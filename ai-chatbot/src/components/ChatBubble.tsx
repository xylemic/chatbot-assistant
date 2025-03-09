import { Message } from "../types";
import { motion } from "framer-motion";
import { useState } from "react";

interface ChatBubbleProps extends Message {
  timestamp?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, isUser, timestamp }) => {
  const [showTimestamp, setShowTimestamp] = useState(false);
  
  // auto-generate timestamp if not provided
  const messageTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2 group`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative p-4 rounded-2xl max-w-xs md:max-w-sm lg:max-w-md break-words shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-br-none"
            : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-none"
        }`}
      >
        <p className="text-sm md:text-base select-text whitespace-pre-wrap">{text}</p>
        
        {/* timestamp */}
        {showTimestamp && (
          <div 
          className={`absolute ${isUser ? "right-2" : "left-2"} -bottom-5 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        >
          {messageTime}
        </div>
        )}
        
        {/* delivered/read status for user messages */}
        {isUser && !showTimestamp && (
          <div className="absolute -bottom-5 right-0 text-xs text-gray-500 flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span>Delivered</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ChatBubble;

