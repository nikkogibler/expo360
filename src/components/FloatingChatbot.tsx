'use client';

/**
 * A floating chatb  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '¡Hola! Soy Sammy 👋, tu asistente del Dashboard de YOUR COMPANY. Estoy aquí para ayudarte a usar todas las herramientas del panel: catálogo de productos, gestión de clientes, ProShotNow™, reportes, Airtable y más. ¿Qué función del Dashboard te gustaría explorar?',
      timestamp: new Date(),
    }
  ]);nent for the admin dashboard.
 * 
 * Simplified version without i18n - displays a floating chat button that opens a chatbot window.
 * Messages are sent to a webhook endpoint configured via environment variable.
 * 
 * @returns {JSX.Element} The floating chatbot UI.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import MessageFormatter from './MessageFormatter';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

// Generate a unique session ID for this conversation
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

interface FloatingChatbotProps {
  webhookUrl?: string;
  userEmail?: string;
}

export default function FloatingChatbot({ 
  webhookUrl,
  userEmail = 'anonymous'
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '¡Hola! Soy Sammy 👋, tu asistente del Dashboard Administrativo YOUR COMPANY. Estoy aquí para ayudarte a usar todas las herramientas del panel: catálogo de productos, gestión de clientes, ProShotNow™, reportes, Airtable y más. ¿Qué función del Dashboard te gustaría explorar?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const quickActions = [
    { label: 'Ayuda con Reportes', icon: '📊', query: '¿Cómo uso los reportes del dashboard?' },
    { label: 'Gestión de Imágenes', icon: '🖼️', query: '¿Cómo gestiono la librería de imágenes?' },
    { label: 'Catálogo de Productos', icon: '🛋️', query: 'Ayúdame con el catálogo de productos' },
    { label: 'Configuración', icon: '⚙️', query: '¿Qué configuraciones están disponibles?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get recent conversation history (last 5 messages) for context
      const recentHistory = messages
        .slice(-5)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Enhanced payload for webhook with session management and conversation history
      const payload = {
        message: content.trim(),
        session_id: sessionId,
        user_email: userEmail,
        timestamp: new Date().toISOString(),
        context: 'admin-dashboard-chat',
        conversation_history: recentHistory, // Helps AI understand conversation flow
      };

      console.log('FloatingChatbot sending to webhook:', payload);

      const endpoint = webhookUrl || process.env.NEXT_PUBLIC_ADMIN_CHATBOT_WEBHOOK || '';
      
      if (!endpoint) {
        throw new Error('No webhook URL configured');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || data.message || 'Recibí tu mensaje. ¿En qué más puedo ayudarte?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response if webhook fails
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const startNewConversation = () => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setMessages([{
      id: '1',
      type: 'bot',
      content: '¡Hola! Soy Sammy, tu asistente administrativo de YOUR COMPANY 👋. ¿Cómo puedo ayudarte hoy?',
      timestamp: new Date(),
    }]);
    console.log('FloatingChatbot: New conversation started:', newSessionId);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full text-gray-700 transition-all duration-200 flex items-center justify-center z-50 group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 20%, #c8c8c8 40%, #b0b0b0 50%, #c8c8c8 60%, #e0e0e0 80%, #f5f5f5 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 4px rgba(255,255,255,0.5), inset 0 -1px 4px rgba(0,0,0,0.2)',
            }}
            aria-label="Abrir chat"
          >
            <MessageCircle className="w-7 h-7 relative z-10" />
            <AnimatePresence>
              {hasNewMessages && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-white shadow-md z-20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between text-white"
                 style={{
                   background: 'linear-gradient(135deg, #404040 0%, #303030 50%, #202020 100%)',
                 }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, #505050 0%, #353535 100%)',
                       boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)',
                     }}>
                  <Sparkles className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Asistente YOUR COMPANY</h3>
                  <p className="text-xs text-gray-300">Siempre aquí para ayudar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startNewConversation}
                  className="w-8 h-8 rounded-full hover:bg-green-600 flex items-center justify-center transition-all duration-200 group"
                  style={{
                    background: '#10b981',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                  }}
                  title="Iniciar nueva conversación"
                >
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-red-600 flex items-center justify-center transition-all duration-200 group"
                  style={{
                    background: '#ef4444',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                  }}
                  aria-label="Cerrar chat"
                >
                  <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative"
                 style={{
                   background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
                 }}>
              {/* Optional: Video Background - uncomment if you have the video */}
              {/* <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                style={{
                  filter: 'blur(1px)',
                }}
              >
                <source src="/videos/backgroundvideo2_wave.mp4" type="video/mp4" />
              </video> */}
              <div className="relative z-10">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.type === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'text-white rounded-bl-sm shadow-sm'
                    }`}
                    style={message.type === 'user' 
                      ? {
                          background: 'linear-gradient(135deg, #505050 0%, #3a3a3a 50%, #282828 100%)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }
                      : {
                          background: 'transparent',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          border: '1px solid rgba(64, 64, 64, 0.5)',
                        }
                    }
                  >
                    <MessageFormatter content={message.content} className="text-sm" />
                    <span className={`text-[10px] mt-1 block ${
                      message.type === 'user' ? 'text-gray-300' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm"
                       style={{
                         background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                         boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                         border: '1px solid #404040',
                       }}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-3 border-t"
                   style={{
                     background: 'linear-gradient(180deg, #252525 0%, #1a1a1a 100%)',
                     borderTop: '1px solid #404040',
                   }}>
                <p className="text-xs text-gray-300 mb-2 font-medium">Acciones rápidas</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center gap-2 p-2 rounded-lg transition-all text-left group"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                        border: '1px solid #404040',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)';
                      }}
                    >
                      <span className="text-lg">{action.icon}</span>
                      <span className="text-xs text-gray-200 flex-1">{action.label}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t"
                  style={{
                    background: 'linear-gradient(180deg, #202020 0%, #151515 100%)',
                    borderTop: '1px solid #404040',
                  }}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent text-sm text-white placeholder-gray-400"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
                    border: '1px solid #404040',
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2.5 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #505050 0%, #3a3a3a 50%, #282828 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
