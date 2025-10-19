import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { FileText, MapPin, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const PatrolDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [assignedReports, setAssignedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'reports'),
      where('patrolUserId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setAssignedReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: newStatus
      });
      setSuccess('Status updated successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    }
  };

  const handleProofUpload = async () => {
    if (!selectedReport || proofFiles.length === 0) return;
    
    setUploadingProof(true);
    setError('');
    
    try {
      const uploadPromises = proofFiles.map(async (file) => {
        const proofRef = ref(storage, `proof/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(proofRef, file);
        return await getDownloadURL(snapshot.ref);
      });
      
      const newProofUrls = await Promise.all(uploadPromises);
      const updatedProofImages = [...(selectedReport.proofImages || []), ...newProofUrls];
      
      await updateDoc(doc(db, 'reports', selectedReport.id), {
        proofImages: updatedProofImages
      });
      
      setSuccess('Proof images uploaded successfully');
      setProofFiles([]);
      setIsProofModalOpen(false);
      setSelectedReport(null);
    } catch (error: any) {
      setError(error.message || 'Failed to upload proof images');
    } finally {
      setUploadingProof(false);
    }
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

  const statusOptions = [
    'in_progress',
    'awaiting_verification',
    'resolved'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading patrol dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Patrol Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your assigned reports and patrol activities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Assigned Reports</dt>
                      <dd className="text-lg font-medium text-gray-900">{assignedReports.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {assignedReports.filter(r => r.status === 'in_progress').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {assignedReports.filter(r => r.status === 'resolved').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Reports */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Assigned Reports</h3>
              
              {assignedReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assigned reports</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any reports assigned to you yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedReports.map((report) => (
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
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' ')}
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
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(report.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setIsProofModalOpen(true);
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Proof
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map View */}
          {assignedReports.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Reports Map</h3>
                <div className="border border-gray-300 rounded-md overflow-hidden" style={{ height: '400px' }}>
                  <MapContainer
                    center={[40.7128, -74.0060]} // Default to NYC, adjust as needed
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {assignedReports.map((report) => (
                      <Marker
                        key={report.id}
                        position={[report.location.lat, report.location.lng]}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                            <p className="text-sm text-gray-600">{report.category}</p>
                            <p className="text-xs text-gray-500">{report.caseNumber}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proof Upload Modal */}
      {isProofModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Proof - {selectedReport.caseNumber}
              </h3>
              <button
                onClick={() => {
                  setIsProofModalOpen(false);
                  setSelectedReport(null);
                  setProofFiles([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Proof Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {proofFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {proofFiles.length} file(s) selected
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {proofFiles.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {success}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsProofModalOpen(false);
                    setSelectedReport(null);
                    setProofFiles([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProofUpload}
                  disabled={uploadingProof || proofFiles.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {uploadingProof ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Proof
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatrolDashboard;
