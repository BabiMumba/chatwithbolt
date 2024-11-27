import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MessageCircle, LogOut } from 'lucide-react';

export default function FriendsList() {
  const [users, setUsers] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setCurrentUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    const fetchUsers = async () => {
      if (!currentUser) return;

      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const usersData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.id !== currentUser.uid); // Filtrer par ID du document

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, [currentUser]);

  const startChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {currentUserData?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {currentUserData?.username}
                </h1>
                <p className="text-sm text-gray-500">{currentUserData?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddFriend(!showAddFriend)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Ajouter un ami</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto p-4">
        {showAddFriend && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Utilisateurs disponibles
            </h3>
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun utilisateur disponible
                </p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => startChat(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {user.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Conversations récentes</h2>
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500">
                Aucune conversation. Commencez par ajouter des amis !
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                onClick={() => startChat(user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium text-lg">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-500">Cliquez pour discuter</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}