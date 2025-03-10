import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// initialize Google Gemini AI API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// middlewares
app.use(express.json()); // parse JSON body
app.use(cors()); // allow frontend requests

// define constants
const chatHistoryPath = path.join(__dirname, "./data/chatHistory.json");
const MAX_MESSAGES = 50; // limit chat history size

// define interface for ChatMessage structure
interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

// interface for request body
interface ChatRequestBody {
  message: string;
}

// load chat history from file
const loadChatHistory = (): ChatMessage[] => {
  try {
    if (fs.existsSync(chatHistoryPath)) {
      const data = fs.readFileSync(chatHistoryPath, "utf8");
      return JSON.parse(data) as ChatMessage[];
    }
  } catch (err) {
    console.error("Error reading chat history:", err);
  }
  return [];
};

// save chat history to file
const saveChatHistory = (history: ChatMessage[]): void => {
  try {
    fs.writeFileSync(chatHistoryPath, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error("Error saving chat history:", err);
  }
};


let lastRequestTime


app.post("/api/chat", async (req: Request<{}, {}, ChatRequestBody>, res: Response): Promise<void> => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    // load existing chat history
    const chatHistory = loadChatHistory();

    // append user message with timestamp
    const userMessage: ChatMessage = {
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    chatHistory.push(userMessage);

    // call Google Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // limit conversation history (send only last 10 messages)
    const historyContext = chatHistory.slice(-10).map((msg) => msg.text).join("\n");

    const result = await model.generateContent(historyContext + "\n" + message);
    const response = result.response;
    const botReply = response.text() || "I'm not sure how to respond.";

    // append bot response
    const botMessage: ChatMessage = {
      text: botReply,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    chatHistory.push(botMessage);

    // trim chat history if it exceeds the max limit
    if (chatHistory.length > MAX_MESSAGES) {
      chatHistory.splice(0, chatHistory.length - MAX_MESSAGES);
    }

    // save updated chat history
    saveChatHistory(chatHistory);

    res.json({ reply: botReply });
  } catch (err) {
    console.error("Error with Google Gemini API:", err);
    res.status(500).json({ error: "Failed to get a response from AI" });
  }
});

// start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
