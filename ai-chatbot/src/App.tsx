import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-xl overflow-hidden bg-gray-950 shadow-2xl border border-gray-800">
        <ChatWindow />
      </div>
    </div>
  )
}

export default App

