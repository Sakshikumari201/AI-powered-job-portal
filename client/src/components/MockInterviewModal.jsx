import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bot, User, Send, X, Mic } from 'lucide-react';

const MockInterviewModal = ({ isOpen, onClose, jobTitle, resumeSkills }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startInterview();
    }
    if (!isOpen) {
      setMessages([]); // Reset when closed
    }
  }, [isOpen]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interview/simulate', {
        jobTitle,
        skills: resumeSkills,
        history: []
      });
      setMessages([{ role: 'model', content: res.data.aiResponse }]);
    } catch (err) {
      setMessages([{ role: 'model', content: 'Failed to connect to the interview AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/interview/simulate', {
        jobTitle,
        skills: resumeSkills,
        history: newMessages
      });
      setMessages([...newMessages, { role: 'model', content: res.data.aiResponse }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'model', content: 'Error getting feedback.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">AI Interviewer</h3>
              <p className="text-xs text-blue-100 font-medium">Practicing for: {jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-200 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-800/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-dark-surface dark:border dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100'
                }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-dark-surface text-gray-500 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm text-sm border border-gray-100 flex items-center gap-2">
                <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={loading}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full pl-5 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2.5">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">AI can make mistakes. Consider verifying important information.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MockInterviewModal;
