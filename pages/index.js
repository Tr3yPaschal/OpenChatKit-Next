import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

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

      reader.read().then(function processText({ done, value }) {
        if (done) {
          setIsLoading(false);
          return;
        }

        setResponse(prev => prev + decoder.decode(value, { stream: true }));
        return reader.read().then(processText);
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to fetch');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with Nav-Bar */}
      <header className="bg-blue-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">NS-OpenChatKit</span>
          {/* Additional Nav items can be added here */}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow p-6 bg-gray-900" style={{ paddingTop: '25px', paddingBottom: '25px', height: 'calc(100% - 50px)' }}>
        <div className="mb-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg" style={{ height: '100%' }}>
          {error && <p className="mb-4 text-red-500">Error: {error}</p>}
          <p className="mb-4 p-4 rounded bg-gray-50 border-gray-100 text-gray-600" style={{ overflowY: 'auto' }}>{response}</p>
        </div>
      </main>



      {/* Sticky Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 sticky bottom-0 flex flex-col items-center">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full pl-4 pr-20 py-3 rounded border border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
            style={{ maxWidth: '800px' }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 rounded bg-blue-500 py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 ${isLoading ? 'bg-gray-500' : 'hover:bg-blue-600'
              }`}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="mt-4">
          &copy; Copyright Nerdskool 2024 - Powered by: GPT neo
        </p>
      </footer>
    </div>
  );

}
