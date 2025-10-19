import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  displayName: string;
  points: number;
  role: string;
  photoURL?: string;
}

const Leaderboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardUser[];
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentUserRank = () => {
    if (!userProfile) return null;
    return users.findIndex(user => user.id === userProfile.uid) + 1;
  };

  const currentUserRank = getCurrentUserRank();

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Community Leaderboard
        </h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Award className="h-5 w-5 mr-2" />
        Community Leaderboard
      </h3>
      
      <div className="space-y-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              user.id === userProfile?.uid ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(index)}`}>
                {getRankIcon(index)}
              </div>
              
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName}
                    {user.id === userProfile?.uid && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{user.points}</span>
              <span className="text-xs text-gray-500">pts</span>
            </div>
          </div>
        ))}
      </div>

      {currentUserRank && currentUserRank > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 ring-2 ring-blue-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800">
                <span className="text-sm font-bold">{currentUserRank}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {userProfile?.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.displayName}
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile?.role}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{userProfile?.points}</span>
              <span className="text-xs text-gray-500">pts</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Earn points by submitting reports and helping keep the community safe!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
