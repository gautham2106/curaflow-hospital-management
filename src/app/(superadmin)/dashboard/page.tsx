'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Eye, Users, Building2, Activity, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuperadminStats {
  total_clinics: number;
  active_clinics: number;
  inactive_clinics: number;
  total_doctors: number;
  total_patients: number;
  total_visits_today: number;
  clinics_created_today: number;
  clinics_created_this_month: number;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  admin_username: string;
  admin_name: string;
  max_doctors: number;
  max_patients_per_day: number;
  is_active: boolean;
  created_at: string;
  last_modified: string;
  modification_notes: string;
  total_doctors: number;
  total_patients: number;
  total_visits_today: number;
}

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  admin_username: string;
  admin_pin: string;
  admin_name: string;
  max_doctors: number;
  max_patients_per_day: number;
  notes: string;
}

export default function SuperadminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<SuperadminStats | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    admin_username: '',
    admin_pin: '',
    admin_name: '',
    max_doctors: 10,
    max_patients_per_day: 100,
    notes: ''
  });
  const { toast } = useToast();

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/superadmin/auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        await fetchData();
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('superadmin_token');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('superadmin_token', result.token);
        setIsAuthenticated(true);
        await fetchData();
        toast({
          title: "Login Successful",
          description: `Welcome, ${result.superadmin.name}!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error || 'Invalid credentials',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Failed to login. Please try again.",
      });
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, clinicsRes] = await Promise.all([
        fetch('/api/superadmin/stats', { headers }),
        fetch('/api/superadmin/clinics', { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (clinicsRes.ok) {
        const clinicsData = await clinicsRes.json();
        setClinics(clinicsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Clinic Created",
          description: result.message,
        });
        setShowCreateDialog(false);
        resetForm();
        await fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "Creation Failed",
          description: result.error || 'Failed to create clinic',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create clinic. Please try again.",
      });
    }
  };

  const handleUpdateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingClinic) return;

    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/clinics/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clinicId: editingClinic.id,
          ...formData
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Clinic Updated",
          description: result.message,
        });
        setShowEditDialog(false);
        setEditingClinic(null);
        resetForm();
        await fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: result.error || 'Failed to update clinic',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update clinic. Please try again.",
      });
    }
  };

  const handleDeactivateClinic = async (clinicId: string) => {
    if (!confirm('Are you sure you want to deactivate this clinic?')) return;

    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/clinics/update?clinicId=${clinicId}&reason=Deactivated by superadmin`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Clinic Deactivated",
          description: result.message,
        });
        await fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "Deactivation Failed",
          description: result.error || 'Failed to deactivate clinic',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deactivate clinic. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      admin_username: '',
      admin_pin: '',
      admin_name: '',
      max_doctors: 10,
      max_patients_per_day: 100,
      notes: ''
    });
  };

  const openEditDialog = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      address: clinic.address || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      admin_username: clinic.admin_username,
      admin_pin: '', // Don't pre-fill PIN for security
      admin_name: clinic.admin_name,
      max_doctors: clinic.max_doctors,
      max_patients_per_day: clinic.max_patients_per_day,
      notes: ''
    });
    setShowEditDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    setIsAuthenticated(false);
    setStats(null);
    setClinics([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Superadmin Login</CardTitle>
            <CardDescription>Access the CuraFlow superadmin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Default credentials:</p>
              <p><strong>Username:</strong> superadmin</p>
              <p><strong>Password:</strong> superadmin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">CuraFlow Superadmin</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_clinics || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.active_clinics || 0} active, {stats?.inactive_clinics || 0} inactive
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_doctors || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all clinics</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered patients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visits Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_visits_today || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all clinics</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Clinics created today: <strong>{stats?.clinics_created_today || 0}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clinics created this month: <strong>{stats?.clinics_created_this_month || 0}</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clinics Tab */}
          <TabsContent value="clinics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Clinic Management</h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Clinic
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Clinic</DialogTitle>
                    <DialogDescription>
                      Create a new clinic with admin credentials and configuration.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateClinic} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Clinic Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter clinic name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter clinic address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin_username">Admin Username *</Label>
                        <Input
                          id="admin_username"
                          value={formData.admin_username}
                          onChange={(e) => setFormData(prev => ({ ...prev, admin_username: e.target.value }))}
                          placeholder="Choose a username"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin_pin">Admin PIN *</Label>
                        <Input
                          id="admin_pin"
                          value={formData.admin_pin}
                          onChange={(e) => setFormData(prev => ({ ...prev, admin_pin: e.target.value }))}
                          placeholder="4-digit PIN"
                          maxLength={4}
                          pattern="[0-9]{4}"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin_name">Admin Full Name *</Label>
                        <Input
                          id="admin_name"
                          value={formData.admin_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, admin_name: e.target.value }))}
                          placeholder="Enter admin full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_doctors">Max Doctors</Label>
                        <Input
                          id="max_doctors"
                          type="number"
                          value={formData.max_doctors}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_doctors: parseInt(e.target.value) }))}
                          min="1"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_patients_per_day">Max Patients/Day</Label>
                        <Input
                          id="max_patients_per_day"
                          type="number"
                          value={formData.max_patients_per_day}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_patients_per_day: parseInt(e.target.value) }))}
                          min="10"
                          max="1000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes (optional)"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Clinic</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinic Name</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinics.map((clinic) => (
                      <TableRow key={clinic.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{clinic.name}</div>
                            <div className="text-sm text-muted-foreground">{clinic.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{clinic.admin_name}</div>
                            <div className="text-sm text-muted-foreground">@{clinic.admin_username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={clinic.is_active ? 'default' : 'destructive'}>
                            {clinic.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Doctors: {clinic.total_doctors}</div>
                            <div>Patients: {clinic.total_patients}</div>
                            <div>Visits Today: {clinic.total_visits_today}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(clinic.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(clinic)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeactivateClinic(clinic.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Clinic</DialogTitle>
            <DialogDescription>
              Update clinic information and configuration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateClinic} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Clinic Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter clinic name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter clinic address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_admin_username">Admin Username *</Label>
                <Input
                  id="edit_admin_username"
                  value={formData.admin_username}
                  onChange={(e) => setFormData(prev => ({ ...prev, admin_username: e.target.value }))}
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_admin_pin">Admin PIN (leave blank to keep current)</Label>
                <Input
                  id="edit_admin_pin"
                  value={formData.admin_pin}
                  onChange={(e) => setFormData(prev => ({ ...prev, admin_pin: e.target.value }))}
                  placeholder="4-digit PIN"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_admin_name">Admin Full Name *</Label>
                <Input
                  id="edit_admin_name"
                  value={formData.admin_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, admin_name: e.target.value }))}
                  placeholder="Enter admin full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_doctors">Max Doctors</Label>
                <Input
                  id="edit_max_doctors"
                  type="number"
                  value={formData.max_doctors}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_doctors: parseInt(e.target.value) }))}
                  min="1"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_max_patients_per_day">Max Patients/Day</Label>
                <Input
                  id="edit_max_patients_per_day"
                  type="number"
                  value={formData.max_patients_per_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_patients_per_day: parseInt(e.target.value) }))}
                  min="10"
                  max="1000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_notes">Modification Notes</Label>
              <Input
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Reason for modification (optional)"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Clinic</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
