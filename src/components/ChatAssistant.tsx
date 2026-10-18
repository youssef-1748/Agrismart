"use client";

import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: 'Salam! Kif ndar m3akom lyoum? Posez vos questions sur l\'irrigation ou vos cultures.' }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Erreur de connexion avec l\'assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-700 hover:bg-green-800 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 transition-transform transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="font-semibold hidden md:inline">Assistant AgriSmart</span>
        </button>
      ) : (
        <div className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-green-200 flex flex-col h-[450px] overflow-hidden">
          {/* Header */}
          <div className="bg-green-700 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center space-x-2">
              <span>🤖 Assistant IA (FR / Darija)</span>
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 p-3 rounded-xl text-sm border border-gray-200 shadow-sm animate-pulse">
                  En train d'écrire...
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question (ex: Wach nsqi lyoum?)..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
            />
            <button type="submit" className="bg-green-700 hover:bg-green-800 text-white p-2 rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}