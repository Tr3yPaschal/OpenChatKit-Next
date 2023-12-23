import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State to track error

  const sendMessage = async () => {
    setIsLoading(true);
    setError(null); // Reset error state on new request
    try {
      const res = await axios.post('http://localhost:3000/', message, {
        headers: {
          'Content-Type': 'text/plain',
        },
        timeout: 20 * 60000, // Timeout set to 20 minutes
      });
      setResponse(res.data);
    } catch (err) {
      console.error('Error sending message:', err);
      // Display detailed error information
      setError(err.response ? `${err.response.data} (Status: ${err.response.status})` : err.message);
      setResponse(''); // Reset response on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900">
      <div className="mb-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <p className="mb-4 text-m font-semibold text-gray-700">Response:</p>
        {error && <p className="mb-4 text-red-500">Error: {error}</p>}
        <p className="mb-4 p-4 rounded bg-gray-50 border-gray-100 text-gray-600">{response}</p>
        <div className="flex gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded border border-gray-300 p-2 text-gray-700 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Send Message
          </button>
        </div>
        {isLoading && <div className="loader"></div>}
      </div>
    </main>
  )
}
