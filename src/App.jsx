import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState('');
  const [webUrl, setWebUrl] = useState('')
  const [webData, setWebData] = useState({})

  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "user" }]);
      setNewMessage('');
    }
  };

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (webUrl.trim()) {
      getWebSiteData()
    }
  }, [])

  const getWebSiteData = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/scrap/cheerio?url=${webUrl}`);
      const data = await response.json();

      // Update web data state
      setWebData(data);

      // Construct messages based on fetched data
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Title: ${data?.title}`, sender: "bot" },
        { text: `Description: ${data?.content?.paragraphs}`, sender: "bot" },
        // ...data.links.map((link, index) => ({ text: link, sender: "bot", key: index }))
      ]);
    } catch (error) {
      console.error("Error fetching website data:", error);
    }
  };


  return (
    <div className="chat-container">
      <div className="message-input">
        <input
          type="text"
          value={webUrl}
          onChange={(e) => setWebUrl(e.target.value)}
          placeholder="Enter Website url..."
        />
        <button onClick={getWebSiteData}>Submit</button>
      </div>
      <div className="message-list">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
          </div>
        ))}
        {/* This is a dummy div to scroll into view */}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
