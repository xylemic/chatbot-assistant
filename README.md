# AI Chatbot Documentation

## Overview
This project is an AI-powered chatbot built using **React + TypeScript + Tailwind** for the frontend and **Node.js + Express + TypeScript** for the backend. It integrates **Google Gemini AI** to generate responses and includes chat history persistence.

## Features
- **Dynamic AI responses** powered by Google Gemini API.
- **Memory persistence**: Stores chat history in a JSON file.
- **Modern UI**: Smooth chat interface with animations and dark mode.
- **Multiline input support**.
- **Deployable on free hosting platforms**: Frontend (Render), Backend (Render).

## Technologies Used
### Frontend
- React.js
- TypeScript
- Tailwind CSS
- Fetch API

### Backend
- Node.js
- Express.js
- TypeScript
- Google Gemini AI API
- File System (`fs`) for chat history

## Installation

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **npm** or **yarn**

### Clone the Repository
```sh
git clone https://github.com/xylemic/chatbot-assistant.git
cd chatbot-assistant
```

### Install Dependencies
#### Backend
```sh
cd /ai-chatbot/backend
npm install
```
#### Frontend
```sh
cd ai-chatbot
npm install
```

## Environment Variables
Create a `.env` file in the **backend** directory and add:
```sh
GOOGLE_API_KEY=your_google_gemini_api_key
PORT=5000
```

## Running the Application
### Start Backend Server
```sh
cd backend
npm run dev
```

### Start Frontend
```sh
cd ai-chatbot
npm run dev
```

The frontend will be accessible at `http://localhost:5173/`

## API Endpoints
### Chat Endpoint
- **POST** `/api/chat`
- **Request Body:**
  ```json
  {
    "message": "Hello, chatbot!"
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Hello! How can I assist you today?"
  }
  ```

## Future Enhancements
- Store chat history in a **database (PostgreSQL)** instead of a JSON file.
- Improve error handling and logging.
- Enhance UI/UX with more animations and features.

## License
This project is open-source and available under the MIT License.

## Author
daniel johnson - https://github.com/xylemic
