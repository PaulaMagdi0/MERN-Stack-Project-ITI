import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // For smooth animations
import { BsChatDots, BsX, BsSend } from "react-icons/bs"; // Icons
import "./Chat.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Controls chat visibility
  const [isLoading, setIsLoading] = useState(false); // Shows bot typing status

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/chat`, { prompt: input }); // ✅ Fixed API field name
      const botMessage = { text: data.reply, sender: "bot" };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { text: "⚠️ Error: Unable to fetch response.", sender: "bot" }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div 
        className="chat-button z-3" 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <BsX size={28} /> : <BsChatDots size={28} />}
      </motion.div>

      {/* Chat Window */}
      {isOpen && (
        <motion.div 
          className="chat-container" 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <div className="chat-header">
            <h4 style={{ color: "white" }}>Book AI Assistant 📚</h4>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="chat-box">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="chat-message bot">⏳ Typing...</div>}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about books..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} // ✅ Use onKeyDown
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} className="send-button" disabled={isLoading}>
              <BsSend size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatBot;
