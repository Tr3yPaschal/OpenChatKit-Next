import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mainContentRef = useRef(null);
  const updatingConversationIndex = useRef(null);

  const sendMessage = async () => {
    if (isLoading || !message.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessage = { message, response: '', timestamp };
    updatingConversationIndex.current = conversations.length;
    setConversations([...conversations, newMessage]);
    setMessage(''); // Clear the input field as soon as the user hits send

    setIsLoading(true);
    setError(null);

    try {
      const responseStream = await fetch('http://localhost:3000/', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: message
      });

      if (!responseStream.ok) {
        throw new Error(`HTTP error! status: ${responseStream.status}`);
      }

      const reader = responseStream.body.getReader();
      const decoder = new TextDecoder();

      let completeResponse = '';

      reader.read().then(function processText({ done, value }) {
        if (done) {
          setConversations(prevConversations => {
            const updatedConversations = [...prevConversations];
            updatedConversations[updatingConversationIndex.current].response = completeResponse;
            return updatedConversations;
          });
          setIsLoading(false);
          return;
        }
        completeResponse += decoder.decode(value, { stream: true });
        return reader.read().then(processText);
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to fetch');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
    }
  }, [conversations]);

  return (
    <div id="header" className="flex flex-col h-screen">
      <header className="bg-blue-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">NS-OpenChatKit</span>
        </nav>
      </header>

      <main id="convo" ref={mainContentRef} className="flex flex-col items-center justify-start flex-grow p-6 bg-gray-900 overflow-y-auto">
        {conversations.map((conv, index) => (
          <div key={index} className="mb-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg relative">
            <div className="flex justify-between">
              <p id="msg-ts" className="text-sm text-gray-500">{conv.timestamp}</p>
              <p id="msg" className="p-4 rounded bg-gray-50 border border-gray-100 text-gray-600">{conv.message}</p>
            </div>
            {conv.response && (
              <div className="flex justify-between">
                <p id="res" className="p-4 rounded bg-gray-200 border border-gray-100 text-gray-600">{conv.response}</p>
                <p id="res-ts" className="text-sm text-gray-500">{conv.timestamp}</p>
              </div>
            )}
            {isLoading && index === conversations.length - 1 && (
              <div id="convo-footer" className="p-2" style={{ height: '40px' }}>
                <div className="loader" style={{ width: '20px', height: '20px', float: 'right' }}></div>
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="bg-gray-800 text-white text-center p-4 sticky bottom-0 flex flex-col items-center">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full pl-4 pr-20 py-3 rounded border border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Type your message here..."
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 rounded bg-blue-500 py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 ${isLoading ? 'bg-gray-500' : 'hover:bg-blue-600'}`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="mt-4">
          &copy; Copyright Nerdskool 2024
        </p>
      </footer>
    </div>
  );
}
