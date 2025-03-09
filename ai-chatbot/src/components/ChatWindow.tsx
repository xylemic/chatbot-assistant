import { useState, useEffect, useRef } from "react";
import { Message } from "../types";
import ChatBubble from "./ChatBubble";
import InputBox from "./InputBox";
import { motion } from "framer-motion";

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null); // used for stopping the req

  const addMessage = async (text: string, isUser: boolean) => {
    // don't add empty messages
    if (!text.trim()) return;

    const timestamp = new Date().toISOString();

    // immediately add the user message
    setMessages((prev) => [
     ...prev,
      { text, isUser, timestamp },
    ]);
    
    // clear any previous errors
    setError(null);

    if (isUser) {
      setIsTyping(true);
      setIsGenerating(true);
      abortControllerRef.current = new AbortController(); // create a new abort controller for each req

      const signal = abortControllerRef.current.signal;

      try {
        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-10) // maintain context with the last 10 msgs
          }),
          signal, // pass the abort signal
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        setMessages((prev) => [
          ...prev, 
          { text: "", isUser: false, timestamp }
        ]);

        await streamResponse(data.reply);
      } catch (error) {
        console.error("Error fetching response:", error);
        setError("Connection error. Please try again later.");
        setMessages((prev) => [
          ...prev,
          { 
            text: "⚠️ Error connecting to the server. Please try again later.", 
            isUser: false,
            timestamp: new Date().toISOString()
          },
        ]);
      } finally {
        setIsTyping(false);
        setIsGenerating(false);
      }
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // cancel the ongoing fetch req
    }
    setIsGenerating(false);
    setIsTyping(false);
  };

  // function to stream response word by word
  const streamResponse = async (fullText: string) => {
    let words = fullText.split(" ");
    let streamedText = "";

    for (let i = 0; i < words.length; i++) {
      streamedText += (i === 0 ? "" : " ") + words[i];

      setMessages((prev) => {
        let updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          text: streamedText,
        };
        return updatedMessages;
      });

      if (abortControllerRef.current?.signal.aborted) return; // Stop if aborted
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

  // auto-scroll to the bottom of the chat window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full w-full mx-auto bg-gray-950 border-gray-800 overflow-hidden transition-all duration-300">
      {/* Chat Header */}
      <div className="p-4 text-center bg-gray-900 text-gray-100 border-b border-gray-800 font-medium shadow-md">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-xs text-gray-400 mt-1">Available 24/7 to help you</p>
      </div>
      
      {/* error banner (conditional) */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/30 border-l-4 border-red-600 text-red-200 p-3 text-sm"
        >
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </motion.div>
      )}
      
      {/* chat messages */}
      <div
        ref={chatContainerRef}
        className="flex flex-col flex-grow overflow-y-auto p-4 space-y-3 bg-gray-950"
        style={{ 
          minHeight: "400px",
          maxHeight: "calc(100vh - 160px)",
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(75, 85, 99, 0.5) transparent'
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-300 text-center font-medium mb-1">Type a message below to start chatting</p>
            <p className="text-gray-500 text-sm">I'm here to help answer your questions</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-full"
          >
            <ChatBubble 
              text={msg.text} 
              isUser={msg.isUser} 
              timestamp={msg.timestamp}
            />
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start ml-2 space-x-2 text-sm text-gray-400 p-2"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* input box stays visible */}
      <div className="flex-shrink-0 border-t border-gray-800 bg-gray-900">
        <InputBox addMessage={addMessage} isGenerating={isGenerating} stopGeneration={stopGeneration} />
      </div>
    </div>
  );
};

export default ChatWindow;

