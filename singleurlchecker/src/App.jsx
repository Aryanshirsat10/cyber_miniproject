import { useState } from "react";
import { Send } from "lucide-react";
import './App.css';
import './index.css';
import { BackgroundLines } from '../components/ui/background-lines';

const App = () => {
  const [url, setUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [whoisData, setWhoisData] = useState("");
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSendClick = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setResponseMessage(data.malicious || 'URL verification successful');
        setIsError(false);
        handleWhoisLookup(url); // Trigger WHOIS lookup after verification
      } else {
        setResponseMessage('Failed to verify the URL');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An error occurred while verifying the URL');
      setIsError(true);
    }
  };

  const handleWhoisLookup = async (url) => {
    try {
      const response = await fetch('http://localhost:3000/api/whois', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.whoisData);
        setWhoisData(data.whoisData);
      } else {
        setWhoisData('Failed to retrieve WHOIS data');
      }
    } catch (error) {
      console.error('Error:', error);
      setWhoisData('An error occurred while fetching WHOIS data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col h-full overflow-x-hidden">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4" />

      <main className="relative z-10 flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
            Welcome to URL Checker
          </h1>
          <div className="flex items-center bg-gray-100 dark:bg-[#171717] rounded-md">
            <input
              type="text"
              placeholder="Enter the URL you want to check"
              className="flex-grow px-4 py-3 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              value={url}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
              aria-label="Ask v0 anything"
            />
            <button
              className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Send message"
              onClick={handleSendClick}
            >
              <Send size={20} />
            </button>
          </div>
          {responseMessage && (
            <p
              className={`mt-4 text-center px-4 py-3 rounded-md ${
                isError
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}
            >
              {responseMessage}
            </p>
          )}
          {whoisData && (
            <pre className="mt-4 text-center px-4 py-3 rounded-md bg-gray-100 dark:bg-[#171717] text-gray-800 dark:text-gray-200">
              {whoisData}
            </pre>
          )}
        </div>
      </main>

      <footer className="relative z-10 p-4 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2025. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
