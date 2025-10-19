import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from './useAuth';

export const useApi = () => {
  const { currentUser } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set up API client with user token
    if (currentUser) {
      currentUser.getIdToken().then((token) => {
        apiClient.setToken(token);
        setIsConnected(true);
      });
    } else {
      apiClient.setToken(null);
      setIsConnected(false);
    }
  }, [currentUser]);

  // Health check
  const checkHealth = async () => {
    try {
      const health = await apiClient.healthCheck();
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  };

  // Reports
  const getReports = async (params?: { status?: string; limit?: number; offset?: number }) => {
    try {
      return await apiClient.getReports(params);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  };

  const getMyReports = async () => {
    try {
      return await apiClient.getMyReports();
    } catch (error) {
      console.error('Failed to fetch my reports:', error);
      throw error;
    }
  };

  const getAssignedReports = async () => {
    try {
      return await apiClient.getAssignedReports();
    } catch (error) {
      console.error('Failed to fetch assigned reports:', error);
      throw error;
    }
  };

  const getReport = async (id: string) => {
    try {
      return await apiClient.getReport(id);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      throw error;
    }
  };

  const createReport = async (data: {
    title: string;
    description: string;
    category: string;
    isAnonymous: boolean;
    location: { lat: number; lng: number };
    imageUrls: string[];
  }) => {
    try {
      return await apiClient.createReport(data);
    } catch (error) {
      console.error('Failed to create report:', error);
      throw error;
    }
  };

  const updateReportStatus = async (id: string, status: string) => {
    try {
      return await apiClient.updateReportStatus(id, status);
    } catch (error) {
      console.error('Failed to update report status:', error);
      throw error;
    }
  };

  const assignReport = async (id: string, patrolUserId: string) => {
    try {
      return await apiClient.assignReport(id, patrolUserId);
    } catch (error) {
      console.error('Failed to assign report:', error);
      throw error;
    }
  };

  const updateReportPriority = async (id: string, priorityLevel: number) => {
    try {
      return await apiClient.updateReportPriority(id, priorityLevel);
    } catch (error) {
      console.error('Failed to update report priority:', error);
      throw error;
    }
  };

  // Users
  const getUsers = async (params?: { role?: string; limit?: number; offset?: number }) => {
    try {
      return await apiClient.getUsers(params);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  };

  const getLeaderboard = async (limit: number = 10) => {
    try {
      return await apiClient.getLeaderboard(limit);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  };

  const getUser = async (id: string) => {
    try {
      return await apiClient.getUser(id);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  };

  const updateUserRole = async (id: string, role: string) => {
    try {
      return await apiClient.updateUserRole(id, role);
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  };

  const banUser = async (id: string, isBanned: boolean) => {
    try {
      return await apiClient.banUser(id, isBanned);
    } catch (error) {
      console.error('Failed to ban/unban user:', error);
      throw error;
    }
  };

  const updateUserPoints = async (id: string, points: number, reason?: string) => {
    try {
      return await apiClient.updateUserPoints(id, points, reason);
    } catch (error) {
      console.error('Failed to update user points:', error);
      throw error;
    }
  };

  const getUserStats = async (id: string) => {
    try {
      return await apiClient.getUserStats(id);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  };

  // Chat
  const getMessages = async (params?: { limit?: number; offset?: number }) => {
    try {
      return await apiClient.getMessages(params);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  };

  const sendMessage = async (text: string) => {
    try {
      return await apiClient.sendMessage(text);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const getConversation = async (userId: string, limit: number = 100) => {
    try {
      return await apiClient.getConversation(userId, limit);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  };

  const getConversations = async () => {
    try {
      return await apiClient.getConversations();
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      return await apiClient.deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  };

  return {
    isConnected,
    checkHealth,
    // Reports
    getReports,
    getMyReports,
    getAssignedReports,
    getReport,
    createReport,
    updateReportStatus,
    assignReport,
    updateReportPriority,
    // Users
    getUsers,
    getLeaderboard,
    getUser,
    updateUserRole,
    banUser,
    updateUserPoints,
    getUserStats,
    // Chat
    getMessages,
    sendMessage,
    getConversation,
    getConversations,
    deleteMessage,
  };
};
