import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { X, MapPin, Upload, CheckCircle } from 'lucide-react';

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
  userId: string;
  patrolUserId?: string;
  proofImages?: string[];
}

interface PatrolUser {
  uid: string;
  displayName: string;
  email: string;
}

interface ReportDetailsModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ report, isOpen, onClose, onUpdate }) => {
  const [patrolUsers, setPatrolUsers] = useState<PatrolUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);

  const statusOptions = [
    'verifying',
    'pending',
    'in_progress',
    'awaiting_verification',
    'resolved',
    'closed'
  ];

  const priorityOptions = [1, 2, 3, 4, 5];

  useEffect(() => {
    if (isOpen) {
      fetchPatrolUsers();
    }
  }, [isOpen]);

  const fetchPatrolUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'patrol'));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as PatrolUser[];
      setPatrolUsers(users);
    } catch (error) {
      console.error('Error fetching patrol users:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return;
    
    setLoading(true);
    setError('');
    
    try {
      await updateDoc(doc(db, 'reports', report.id), {
        status: newStatus
      });
      
      // Award points if report is resolved
      if (newStatus === 'resolved') {
        try {
          await updateDoc(doc(db, 'users', report.userId), {
            points: increment(10)
          });
          setSuccess('Status updated successfully! User awarded 10 points for resolved report.');
        } catch (pointsError) {
          console.error('Error awarding points:', pointsError);
          setSuccess('Status updated successfully, but failed to award points.');
        }
      } else {
        setSuccess('Status updated successfully');
      }
      
      onUpdate();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: number) => {
    if (!report) return;
    
    setLoading(true);
    setError('');
    
    try {
      await updateDoc(doc(db, 'reports', report.id), {
        priorityLevel: newPriority
      });
      setSuccess('Priority updated successfully');
      onUpdate();
    } catch (error: any) {
      setError(error.message || 'Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const handlePatrolAssignment = async (patrolUserId: string) => {
    if (!report) return;
    
    setLoading(true);
    setError('');
    
    try {
      await updateDoc(doc(db, 'reports', report.id), {
        patrolUserId: patrolUserId
      });
      setSuccess('Report assigned successfully');
      onUpdate();
    } catch (error: any) {
      setError(error.message || 'Failed to assign report');
    } finally {
      setLoading(false);
    }
  };

  const handleProofUpload = async () => {
    if (!report || proofFiles.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const uploadPromises = proofFiles.map(async (file) => {
        const proofRef = ref(storage, `proof/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(proofRef, file);
        return await getDownloadURL(snapshot.ref);
      });
      
      const newProofUrls = await Promise.all(uploadPromises);
      const updatedProofImages = [...(report.proofImages || []), ...newProofUrls];
      
      await updateDoc(doc(db, 'reports', report.id), {
        proofImages: updatedProofImages
      });
      
      setSuccess('Proof images uploaded successfully');
      setProofFiles([]);
      onUpdate();
    } catch (error: any) {
      setError(error.message || 'Failed to upload proof images');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verifying':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'awaiting_verification':
        return 'bg-purple-100 text-purple-800';
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
      case 4:
        return 'bg-blue-100 text-blue-800';
      case 5:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Report Details - {report.caseNumber}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Report Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Report Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Title:</span>
                  <p className="text-sm text-gray-900">{report.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-sm text-gray-900">{report.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-sm text-gray-900">{report.description}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <p className="text-sm text-gray-900">{formatDate(report.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Anonymous:</span>
                  <p className="text-sm text-gray-900">{report.isAnonymous ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Location</h4>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Admin Controls</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={report.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={loading}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={report.priorityLevel}
                  onChange={(e) => handlePriorityChange(parseInt(e.target.value))}
                  disabled={loading}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>
                      Priority {priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Patrol Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Patrol
                </label>
                <select
                  value={report.patrolUserId || ''}
                  onChange={(e) => handlePatrolAssignment(e.target.value)}
                  disabled={loading}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select patrol officer</option>
                  {patrolUsers.map(user => (
                    <option key={user.uid} value={user.uid}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Current Status Display */}
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' ')}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priorityLevel)}`}>
              Priority {report.priorityLevel}
            </span>
            {report.patrolUserId && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Assigned
              </span>
            )}
          </div>

          {/* Report Images */}
          {report.imageUrls.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Report Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Report image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Proof Images */}
          {report.proofImages && report.proofImages.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Proof Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.proofImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Proof image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Proof Upload */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Upload Proof Images</h4>
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {proofFiles.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {proofFiles.length} file(s) selected
                  </span>
                  <button
                    onClick={handleProofUpload}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Proof
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;
