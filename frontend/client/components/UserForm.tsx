import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { User, UserRole, UserCreateRequest, createDefaultPermissions } from "../../shared/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Shield,
  Key,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserFormProps {
  userId?: string;
  mode: "create" | "edit";
  onClose?: () => void;
}

const departments = [
  "IT Administration",
  "Operations",
  "Logistics",
  "Management",
  "Fleet Management",
  "Finance",
  "Human Resources",
  "Customer Service",
];

const permissions = [
  { id: "trips.view", label: "View Trips", category: "Transportation" },
  { id: "trips.create", label: "Create Trips", category: "Transportation" },
  { id: "trips.edit", label: "Edit Trips", category: "Transportation" },
  { id: "trips.delete", label: "Delete Trips", category: "Transportation" },
  { id: "inventory.view", label: "View Inventory", category: "Inventory" },
  { id: "inventory.create", label: "Add Trucks", category: "Inventory" },
  { id: "inventory.edit", label: "Edit Trucks", category: "Inventory" },
  { id: "inventory.delete", label: "Delete Trucks", category: "Inventory" },
  { id: "reports.view", label: "View Reports", category: "Reports" },
  { id: "reports.export", label: "Export Reports", category: "Reports" },
  { id: "users.view", label: "View Users", category: "User Management" },
  { id: "users.create", label: "Create Users", category: "User Management" },
  { id: "users.edit", label: "Edit Users", category: "User Management" },
  { id: "users.delete", label: "Delete Users", category: "User Management" },
];

export default function UserForm({ userId, mode, onClose }: UserFormProps) {
  const navigate = useNavigate();
  const { addUser, updateUser, getUser } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "staff" as UserRole,
    status: "active" as User["status"],
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
    permissions: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && userId) {
      const user = getUser(userId);
      console.log('Editing user:', user);
      if (user) {
        // Handle permissions properly - user.permissions is an object, not an array
        let userPermissions: string[] = [];
        if (user.role === 'admin') {
          userPermissions = ['all'];
        } else {
          // Convert permission object to array of permission strings
          if (user.permissions) {
            // Extract permission strings based on the permission object structure
            const perms = user.permissions as any;
            if (perms.transportation?.viewTrips) userPermissions.push('trips.view');
            if (perms.transportation?.createTrips) userPermissions.push('trips.create');
            if (perms.transportation?.editTrips) userPermissions.push('trips.edit');
            if (perms.transportation?.deleteTrips) userPermissions.push('trips.delete');
            if (perms.inventory?.viewInventory) userPermissions.push('inventory.view');
            if (perms.inventory?.addTrucks) userPermissions.push('inventory.create');
            if (perms.inventory?.editTrucks) userPermissions.push('inventory.edit');
            if (perms.inventory?.deleteTrucks) userPermissions.push('inventory.delete');
            if (perms.reports?.viewReports) userPermissions.push('reports.view');
            if (perms.reports?.exportReports) userPermissions.push('reports.export');
            if (perms.userManagement?.viewUsers) userPermissions.push('users.view');
            if (perms.userManagement?.createUsers) userPermissions.push('users.create');
            if (perms.userManagement?.editUsers) userPermissions.push('users.edit');
            if (perms.userManagement?.deleteUsers) userPermissions.push('users.delete');
          }
        }
        
        setFormData({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
          department: user.department || "",
          phone: user.phone || "",
          password: "",
          confirmPassword: "",
          permissions: userPermissions,
        });
      }
    }
  }, [mode, userId, getUser]);

  // Auto-set permissions based on role
  useEffect(() => {
    if (formData.role === "admin") {
      setFormData((prev) => ({ ...prev, permissions: ["all"] }));
    } else if (
      formData.role === "staff" &&
      formData.permissions.includes("all")
    ) {
      // If changing from admin to staff, reset permissions
      setFormData((prev) => ({
        ...prev,
        permissions: ["trips.view", "inventory.view", "reports.view"],
      }));
    }
  }, [formData.role]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (mode === "create") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (formData.role === "staff" && formData.permissions.length === 0) {
      newErrors.permissions =
        "At least one permission is required for staff users";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (mode === "create") {
        // Create proper UserCreateRequest object with all required fields
        const createUserData: UserCreateRequest = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          status: formData.status,
          department: formData.department || undefined,
          phone: formData.phone || undefined,
          password: formData.password, // Include password for creation
          permissions: createDefaultPermissions(formData.role) // Use proper permissions structure
        };
        
        console.log('Submitting user creation data:', createUserData);
        success = await addUser(createUserData);
        if (success) {
          toast({
            title: "User Created",
            description: `${formData.fullName} has been added successfully.`,
          });
        }
      } else if (mode === "edit" && userId) {
        // For updates, only send fields that can be updated (no password unless specifically changing it)
        const updateUserData = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          status: formData.status,
          department: formData.department || undefined,
          phone: formData.phone || undefined,
          permissions: createDefaultPermissions(formData.role)
        };
        
        console.log('Submitting user update data:', updateUserData);
        success = await updateUser(userId, updateUserData);
        if (success) {
          toast({
            title: "User Updated",
            description: `${formData.fullName} has been updated successfully.`,
          });
        }
      }

      if (success) {
        if (onClose) {
          onClose();
        } else {
          navigate("/users");
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save user. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/users");
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (formData.role === "admin") return; // Admin permissions are fixed

    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter((p) => p !== permissionId),
    }));
  };

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, typeof permissions>,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {mode === "create" ? "Add New User" : "Edit User"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Create a new user account with appropriate permissions"
              : "Update user information and permissions"}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                disabled={mode === "edit"} // Username shouldn't be changed after creation
                className={errors.username ? "border-destructive" : ""}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+91 98765 43210"
                  className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="enhanced-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent" />
                      Administrator
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      Staff Member
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: User["status"]) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <Badge variant="default" className="bg-success">
                      Active
                    </Badge>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <Badge variant="secondary">Inactive</Badge>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <Badge variant="destructive">Suspended</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "create" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className={`pl-10 pr-10 ${
                        errors.password ? "border-destructive" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={`pl-10 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        {formData.role === "staff" && (
          <Card className="enhanced-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Permissions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select the permissions for this staff member
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([category, categoryPermissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-sm text-foreground">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(
                              permission.id,
                            )}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                permission.id,
                                checked as boolean,
                              )
                            }
                          />
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ),
              )}
              {errors.permissions && (
                <p className="text-sm text-destructive">{errors.permissions}</p>
              )}
            </CardContent>
          </Card>
        )}

        {formData.role === "admin" && (
          <Card className="enhanced-card border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg">
                <Shield className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold text-accent">
                    Administrator Permissions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Administrators have full access to all features and can
                    manage other users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-enhanced admin-action-btn"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {mode === "create" ? "Create User" : "Update User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
