import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true); // State for controlling the modal
  const [serverUrl, setServerUrl] = useState('https://6a28202448b7.ngrok.app'); // Default server URL
  const [isInputDisabled, setIsInputDisabled] = useState(true); // State to disable message-input
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true); // State to disable send-button

  const mainContentRef = useRef(null);
  const updatingConversationIndex = useRef(null);

  const sendMessage = async () => {
    if (isLoading || !message.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newMessage = { message, response: '', timestamp };
    updatingConversationIndex.current = conversations.length;
    setConversations((prevConversations) => [...prevConversations, newMessage]);
    setMessage(''); // Clear the input field as soon as the user hits send

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer a1f7e49d-64df-4f0e-94dd-9629464ed6b9',
        },
        body: `message=${encodeURIComponent(message)}`,
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();
      const responseText = responseJson.response;

      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        updatedConversations[updatingConversationIndex.current].response = responseText;
        return updatedConversations;
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to fetch');
      setIsLoading(false);
    }
  };

  const handleConfigSubmit = () => {
    setIsModalOpen(false);
    setIsInputDisabled(false); // Enable message-input
    setIsSendButtonDisabled(false); // Enable send-button
    setServerUrl(document.getElementById('config-input').value);
  };

  const handleCloseButtonClick = () => {
    setIsModalOpen(false);
    setIsInputDisabled(false); // Enable message-input
    setIsSendButtonDisabled(false); // Enable send-button
  };

  const handleConfigButtonClick = () => {
    setIsModalOpen(true);
    setIsInputDisabled(true); // Disable message-input
    setIsSendButtonDisabled(true); // Disable send-button
  };

  // Function to handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && message.trim() !== '') {
      // Call your function here
      sendMessage();
    }
  };

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
    }
  }, [conversations]);

  return (
    <div id="header" className="flex flex-col h-screen">
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <nav className="container mx-auto flex items-center">
          <span className="text-xl font-bold">NS-OpenChatKit</span>
        </nav>
        <button
          id="config-button"
          onClick={handleConfigButtonClick} // Open the modal when the button is clicked
          className="inline-flex items-center justify-center w-10 h-10 mr-2 text-gray-700 transition-colors duration-150 bg-white rounded-full focus:shadow-outline hover:bg-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.260.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </header>

      <main id="convo" ref={mainContentRef} className="flex flex-col items-center justify-start flex-grow p-6 bg-gray-900 overflow-y-auto">
        {conversations.map((conv, index) => (
          <div key={index} className="mb-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg relative">
            <div className="flex justify-between mb-10">
              <p id="msg" className="mr-5 w-4/5 p-4 rounded bg-gray-50 border border-gray-100 text-gray-600">{conv.message}</p>
              <p id="msg-ts" className="w-1/5 flex justify-end text-sm text-gray-500">{conv.timestamp}</p>
            </div>
            {conv.response && (
              <div className="flex justify-between mb-10">
                <p id="res-ts" className="w-1/5 flex float-left text-sm text-gray-500">{conv.timestamp}</p>
                <p id="res" className="ml-5 w-4/5 p-4 rounded bg-gray-200 border border-gray-100 text-gray-600">{conv.response}</p>
              </div>
            )}
            {isLoading && index === conversations.length - 1 && (
              <div id="convo-footer" className="p-2" style={{ height: '30px' }}>
                <div className="loader" style={{ width: '20px', height: '20px', float: 'right' }}></div>
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Modal for configuring server URL */}
      {isModalOpen && (
        <div className="w-full h-full fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-800 bg-opacity-70">
          <div className="w-1/3 bg-white w-700 p-4 rounded-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Server URL</h2>
              <button
                id="close-button"
                onClick={handleCloseButtonClick} // Close the modal when the button is clicked
                className="inline-flex items-center justify-center w-10 h-10 text-white-100 transition-colors duration-150 bg-red-500 rounded-lg focus:shadow-outline hover:bg-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                id="config-input"
                className="w-full pl-4 pr-20 py-3 rounded border border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="Add your server URL here..."
              />
              <button
                onClick={handleConfigSubmit}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded bg-blue-500 py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white text-center p-4 sticky bottom-0 flex flex-col items-center">
        <div className="relative w-full max-w-2xl">
          <input
            id="message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-4 pr-20 py-3 rounded border border-gray-300 text-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Type your message here..."
            disabled={isInputDisabled}
          />
          <button
            id="send-button"
            onClick={sendMessage}
            disabled={isLoading || isSendButtonDisabled}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 rounded bg-blue-500 py-2 px-4 text-white focus:outline-none focus:ring focus:ring-blue-300 ${
              isLoading ? 'bg-gray-500' : 'hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Sending...' : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
            </svg>}
          </button>
        </div>
        <p className="mt-4">&copy; Copyright Nerdskool 2024</p>
      </footer>
    </div>
  );
}
