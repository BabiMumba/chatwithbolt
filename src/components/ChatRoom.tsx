import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ChatRoom() {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser || !friendId) return;

    const chatIds = [
      `${currentUser.uid}_${friendId}`,
      `${friendId}_${currentUser.uid}`,
    ];

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', 'in', chatIds),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
        setError('');
      },
      error: (err) => {
        console.error('Error fetching messages:', err);
        if (err.code === 'failed-precondition') {
          setError('Configuration de l\'index en cours... Veuillez patienter quelques instants.');
        } else {
          setError('Une erreur est survenue lors du chargement des messages.');
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser, friendId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: new Date().toISOString(),
        uid: currentUser.uid,
        chatId: `${currentUser.uid}_${friendId}`,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erreur lors de l\'envoi du message.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white p-4 shadow-sm flex items-center gap-2">
        <button
          onClick={() => navigate('/friends')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold">Chat</h1>
      </div>

      {error && (
        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.uid === currentUser?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.uid === currentUser?.uid
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="break-words">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.uid === currentUser?.uid
                    ? 'text-purple-200'
                    : 'text-gray-500'
                }`}
              >
                {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
}