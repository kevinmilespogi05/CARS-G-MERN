import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase/config';
import { MapPin, Upload, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReportFormData {
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  location: { lat: number; lng: number } | null;
  images: File[];
}

const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const NewReportForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    category: '',
    isAnonymous: false,
    location: null,
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Theft',
    'Vandalism',
    'Suspicious Activity',
    'Traffic Violation',
    'Noise Complaint',
    'Property Damage',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: { lat, lng }
    }));
  };

  const generateCaseNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CARS-${timestamp.slice(-6)}-${random}`;
  };

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const imageRef = ref(storage, `reports/${Date.now()}-${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      
      // Update progress
      setUploadProgress(((index + 1) / images.length) * 100);
      
      return url;
    });
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.location) {
      setError('Please select a location on the map');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to submit a report');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload images to Firebase Storage
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      // Create report document in Firestore
      const reportData = {
        caseNumber: generateCaseNumber(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isAnonymous: formData.isAnonymous,
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng
        },
        imageUrls,
        status: 'verifying',
        priorityLevel: 1,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'reports'), reportData);

      setSuccess('Report submitted successfully! Your case number is ' + reportData.caseNumber);
      setFormData({
        title: '',
        description: '',
        category: '',
        isAnonymous: false,
        location: null,
        images: []
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      setError(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Submit a Safety Report</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Report Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the incident"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide detailed information about the incident"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Anonymous Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAnonymous"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
            Submit anonymously
          </label>
        </div>

        {/* Map */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location * <span className="text-gray-500">(Click on the map to select)</span>
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden" style={{ height: '300px' }}>
            <MapContainer
              center={[40.7128, -74.0060]} // Default to NYC, adjust as needed
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              {formData.location && (
                <Marker position={[formData.location.lat, formData.location.lng]} />
              )}
            </MapContainer>
          </div>
          {formData.location && (
            <p className="mt-2 text-sm text-gray-600">
              <MapPin className="inline h-4 w-4 mr-1" />
              Selected: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">
            Images (Optional)
          </label>
          <div className="mt-1">
            <input
              ref={fileInputRef}
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">Upload one or more images (PNG, JPG, GIF)</p>
          </div>
          
          {/* Display selected images */}
          {formData.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError('')}
            onRetry={() => handleSubmit(new Event('submit') as any)}
          />
        )}

        {success && (
          <SuccessMessage 
            message={success} 
            onDismiss={() => setSuccess('')}
          />
        )}

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Uploading images...</span>
              <span className="text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !formData.location}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" text="" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewReportForm;
