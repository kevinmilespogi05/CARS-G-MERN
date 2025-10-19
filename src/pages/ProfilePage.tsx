import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Award, Calendar, Clock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();

  if (!userProfile || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'patrol':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superAdmin':
        return '👑';
      case 'admin':
        return '⚡';
      case 'patrol':
        return '🛡️';
      default:
        return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-shrink-0">
                  {userProfile.photoURL ? (
                    <img
                      className="h-16 w-16 rounded-full"
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile.displayName}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userProfile.role)}`}>
                      <span className="mr-1">{getRoleIcon(userProfile.role)}</span>
                      {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                      <dd className="mt-1 flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {userProfile.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {userProfile.uid}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                      <dd className="mt-1 flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(userProfile.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                      <dd className="mt-1 flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(userProfile.lastActive)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Points and Achievements */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Community Points
                  </h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {userProfile.points}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Community Safety Points</p>
                    
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-900 mb-2">How to earn points:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Report safety incidents (+10 pts)</li>
                        <li>• Complete patrol shifts (+25 pts)</li>
                        <li>• Help community members (+15 pts)</li>
                        <li>• Attend safety meetings (+20 pts)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-specific information */}
              {userProfile.role === 'patrol' && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Patrol Member Benefits
                  </h3>
                  <p className="text-sm text-blue-700">
                    As a patrol member, you have access to patrol tools, community safety reports, and enhanced reporting capabilities.
                  </p>
                </div>
              )}

              {(userProfile.role === 'admin' || userProfile.role === 'superAdmin') && (
                <div className="mt-6 bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Administrator Access
                  </h3>
                  <p className="text-sm text-purple-700">
                    You have administrative privileges to manage users, view analytics, and oversee community safety operations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
