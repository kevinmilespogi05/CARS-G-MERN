import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FileText, Calendar, MapPin, Image as ImageIcon, Eye } from 'lucide-react';

interface Report {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priorityLevel: number;
  createdAt: any;
  location: {
    lat: number;
    lng: number;
  };
  imageUrls: string[];
  isAnonymous: boolean;
}

const UserReportsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verifying':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Reports</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Reports</h3>
      
      {reports.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Submit your first safety report using the form above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                    <span className="text-xs text-gray-500">#{report.caseNumber}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priorityLevel)}`}>
                      Priority {report.priorityLevel}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(report.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                    </div>
                    {report.imageUrls.length > 0 && (
                      <div className="flex items-center">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {report.imageUrls.length} image{report.imageUrls.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {report.isAnonymous && (
                      <span className="text-gray-400">Anonymous</span>
                    )}
                  </div>
                </div>
                
                <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReportsList;
