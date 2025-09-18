import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiClient, API_ENDPOINTS, User, UserRole, UserCreateRequest, ApiResponse, PaginatedResponse } from "../../shared/api";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "./AuthContext";

interface UserContextType {
  users: User[];
  loading: boolean;
  addUser: (userData: UserCreateRequest) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getUser: (id: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  searchUsers: (query: string) => User[];
  toggleUserStatus: (id: string) => Promise<boolean>;
  resetUserPassword: (id: string) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('👤 UserContext useEffect triggered');
    console.log('👤 isAuthenticated:', isAuthenticated);
    console.log('👤 user:', user);
    console.log('👤 user.role:', user?.role);
    
    // Fetch users if authenticated (temporarily removing admin check for debugging)
    if (isAuthenticated) {
      console.log('👤 User authenticated, fetching users list...');
      refreshUsers();
    } else {
      console.log('👤 User not authenticated, skipping user fetch');
      console.log('👤 Reason - isAuthenticated:', isAuthenticated);
    }
  }, [isAuthenticated]);

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.USERS.LIST);
      console.log('Users API Response:', response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.users:', response.users);
      console.log('Response.data:', response.data);
      
      // Try different response structures
      let userData = null;
      
      if (response.success) {
        // Check for users in various possible locations
        userData = response.users || response.data || response.result;
        console.log('Found userData in success response:', userData);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        userData = response;
        console.log('Direct array response:', userData);
      } else if (response.users) {
        // Direct users property
        userData = response.users;
        console.log('Found users in response.users:', userData);
      } else {
        console.warn('Could not find users in response:', response);
      }
      
      if (userData && Array.isArray(userData)) {
        setUsers(userData);
        console.log('Users successfully set:', userData.length, 'users');
        console.log('First user example:', userData[0]);
      } else {
        console.warn('No valid users array found, userData:', userData);
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const addUser = useCallback(
    async (userData: UserCreateRequest): Promise<boolean> => {
      setLoading(true);
      try {
        console.log('Creating user with data:', userData);
        const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.USERS.CREATE, userData);
        console.log('User creation response:', response);
        
        console.log('Add user response:', response);
        if (response.success) {
          // Check for user data in different possible locations
          const userData = response.user || response.data;
          if (userData) {
            setUsers(prev => [...prev, userData]);
            toast({
              title: "User Created",
              description: "New user has been successfully created.",
            });
            return true;
          } else {
            console.log('User created but no user data returned, refreshing users...');
            // Refresh the users list to get the new user
            refreshUsers();
            toast({
              title: "User Created",
              description: "New user has been successfully created.",
            });
            return true;
          }
        } else {
          // Handle API error response
          const errorMsg = response.error || response.message || "Failed to create user";
          throw new Error(errorMsg);
        }
        return false;
      } catch (error: any) {
        console.error("Error adding user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create user. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateUser = useCallback(
    async (id: string, userData: Partial<User>): Promise<boolean> => {
      setLoading(true);
      try {
        console.log('Updating user:', id, 'with data:', userData);
        const response = await apiClient.put<any>(API_ENDPOINTS.USERS.UPDATE(id), userData);
        console.log('Update user response:', response);
        
        if (response.success) {
          const updatedUser = response.user || response.data;
          if (updatedUser) {
            setUsers(prev => prev.map(u => (u._id === id) ? updatedUser : u));
          } else {
            // Refresh users list to get updated user
            refreshUsers();
          }
          toast({
            title: "User Updated",
            description: "User details have been successfully updated.",
          });
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error updating user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update user. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        // Check if user is the last admin
        const user = users.find(u => u._id === id);
        if (user?.role === "admin") {
          const adminCount = users.filter(u => u.role === "admin").length;
          if (adminCount <= 1) {
            toast({
              title: "Cannot Delete",
              description: "Cannot delete the last admin user.",
              variant: "destructive",
            });
            return false;
          }
        }

        const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.USERS.DELETE(id));
        if (response.success) {
          setUsers(prev => prev.filter(u => u._id !== id));
          toast({
            title: "User Deleted",
            description: "User has been successfully deleted.",
          });
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete user. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [users],
  );

  const getUser = useCallback(
    (id: string): User | undefined => {
      return users.find((user) => user._id === id);
    },
    [users],
  );

  const getUsersByRole = useCallback(
    (role: UserRole): User[] => {
      return users.filter((user) => user.role === role);
    },
    [users],
  );

  const searchUsers = useCallback(
    (query: string): User[] => {
      if (!query.trim()) return users;

      const lowercaseQuery = query.toLowerCase();
      return users.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercaseQuery) ||
          user.email.toLowerCase().includes(lowercaseQuery) ||
          user.fullName.toLowerCase().includes(lowercaseQuery) ||
          user.department?.toLowerCase().includes(lowercaseQuery),
      );
    },
    [users],
  );

  const toggleUserStatus = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        console.log('Toggling status for user:', id);
        const response = await apiClient.put<any>(API_ENDPOINTS.USERS.TOGGLE_STATUS(id));
        console.log('Toggle status response:', response);
        
        if (response.success) {
          const updatedUser = response.user || response.data;
          if (updatedUser) {
            setUsers(prev => prev.map(u => (u._id === id) ? updatedUser : u));
          } else {
            // Refresh users list to get updated status
            refreshUsers();
          }
          toast({
            title: "Status Updated",
            description: "User status has been toggled successfully.",
          });
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error toggling user status:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update user status.",
          variant: "destructive",
        });
        return false;
      }
    },
    [],
  );

  const resetUserPassword = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await apiClient.put<ApiResponse>(API_ENDPOINTS.USERS.RESET_PASSWORD(id), {});
        if (response.success) {
          toast({
            title: "Password Reset",
            description: "User password has been reset successfully.",
          });
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Error resetting password:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to reset password.",
          variant: "destructive",
        });
        return false;
      }
    },
    [],
  );

  const value: UserContextType = {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    getUser,
    getUsersByRole,
    searchUsers,
    toggleUserStatus,
    resetUserPassword,
    refreshUsers,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
