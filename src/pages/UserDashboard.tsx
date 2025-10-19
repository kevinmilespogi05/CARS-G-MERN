import React from 'react';
import NewReportForm from '../components/NewReportForm';
import UserReportsList from '../components/UserReportsList';
import Leaderboard from '../components/Leaderboard';
import Chat from '../components/Chat';

const UserDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Community Safety Dashboard</h1>
            <p className="mt-2 text-gray-600">Report incidents and track your safety contributions</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-8">
              {/* New Report Form */}
              <div className="animate-slide-up">
                <NewReportForm />
              </div>
              
              {/* User's Reports */}
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <UserReportsList />
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Leaderboard */}
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Leaderboard />
              </div>
              
              {/* Chat */}
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Chat />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
