import { useState, useRef, useEffect } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface InputBoxProps {
  addMessage: (text: string, isUser: boolean) => Promise<void>;
  isGenerating: boolean;
  stopGeneration?: () => void;
}

const InputBox: React.FC<InputBoxProps> = ({ addMessage, stopGeneration, isGenerating }) => {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await addMessage(input, true);
    setInput("");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = (emoji: any) => {
    setInput((prev) => prev + emoji.emoji);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-16 left-2 z-10 shadow-xl rounded-lg overflow-hidden"
          style={{ maxHeight: "350px" }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} searchPlaceHolder="Search emoji..." width={300} height={350} />
        </div>
      )}

      <div className="flex items-center gap-2 p-3 bg-gray-900 rounded-lg">
        <button
          ref={emojiButtonRef}
          className="p-2 text-xl bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-150 flex items-center justify-center w-10 h-10"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          aria-label="Open emoji picker"
          title="Open emoji picker"
        >
          <span className="transform hover:scale-110 transition-transform duration-150">😊</span>
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 pr-12 resize-none overflow-y-auto max-h-32"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={2}
            disabled={isGenerating}
          />
        </div>

        {isGenerating ? (
          <button
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center w-10 h-10"
            onClick={stopGeneration}
            aria-label="Stop generation"
            title="Stop generation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12v12H6z" />
            </svg>
          </button>
        ) : (
          <button
            className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center w-10 h-10 ${
              input.trim()
                ? "bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
                : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-75"
            }`}
            onClick={sendMessage}
            disabled={!input.trim()}
            aria-label="Send message"
            title="Send message"
          >
            <svg className="w-5 h-5 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default InputBox;

