import { useState, useEffect, useRef } from 'react';
import './App.css';
import nlp from 'compromise';

function App() {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [webData, setWebData] = useState({});
  const [protocol, setProtocol] = useState('https://');

  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = { text: newMessage, sender: "user" };
      setMessages([...messages, userMessage]);
      handleQuestion(newMessage);
      setNewMessage('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWebSiteData = async () => {
    try {
      let fullUrl = webUrl;

      // Check if webUrl starts with http:// or https://
      if (!/^https?:\/\//i.test(webUrl)) {
        fullUrl = `${protocol}${webUrl}`;
      }

      const response = await fetch(`${apiEndpoint}/scrap/cheerio?url=${fullUrl}`);
      const data = await response.json();

      setWebData(data);

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Title: ${data?.title}`, sender: "bot" },
        { text: `Description: ${data?.content?.paragraphs.join(' ')}`, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error fetching website data:", error);
    }
  };

  const handleQuestion = (question) => {
    let answer = "Sorry, I don't have an answer for that.";

    // // Basic NLP with keyword matching
    // if (question.includes("title")) {
    //   answer = `The title is: ${webData?.title}`;
    // } else if (question.includes("description") || question.includes("content")) {
    //   answer = `The description is: ${webData?.content?.paragraphs.join(' ')}`;
    // } else if (question.includes("links")) {
    //   const links = webData?.content?.links?.join(', ') || 'No links found';
    //   answer = `Here are the links: ${links}`;
    // }

    // Example of using a more advanced NLP approach
    const doc = nlp(question);
    if (doc.has('title')) {
      answer = `The title is: ${webData?.title}`;
    } else if (doc.has('description') || doc.has('content')) {
      answer = `The description is: ${webData?.content?.paragraphs.join(' ')}`;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: answer, sender: "bot" },
    ]);
  };

  const handleProtocolChange = (event) => {
    setProtocol(event.target.value + '://');
  };

  return (
    <div className="chat-container">
      <div className="url-input">
        <select value={protocol.replace('://', '')} onChange={handleProtocolChange}>
          <option value="http">http</option>
          <option value="https">https</option>
        </select>
        <input
          type="text"
          value={webUrl}
          onChange={(e) => setWebUrl(e.target.value)}
          placeholder="Enter Website URL..."
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
