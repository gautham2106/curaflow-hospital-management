'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClinicRegistrationData {
  name: string;
  address: string;
  phone: string;
  email: string;
  admin_username: string;
  admin_pin: string;
  admin_name: string;
  subscription_plan: string;
  max_doctors: number;
  max_patients_per_day: number;
}

export default function ClinicRegistration() {
  const [formData, setFormData] = useState<ClinicRegistrationData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    admin_username: '',
    admin_pin: '',
    admin_name: '',
    subscription_plan: 'basic',
    max_doctors: 10,
    max_patients_per_day: 100
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleInputChange = (field: keyof ClinicRegistrationData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Clinic name is required');
      return false;
    }
    if (!formData.admin_username.trim()) {
      setErrorMessage('Admin username is required');
      return false;
    }
    if (!formData.admin_pin || !/^\d{4}$/.test(formData.admin_pin)) {
      setErrorMessage('Admin PIN must be exactly 4 digits');
      return false;
    }
    if (!formData.admin_name.trim()) {
      setErrorMessage('Admin name is required');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setRegistrationStatus('error');
      return;
    }

    setIsLoading(true);
    setRegistrationStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRegistrationStatus('success');
        toast({
          title: "Clinic Registered Successfully!",
          description: `Welcome ${result.clinic.name}! You can now login with username: ${result.clinic.admin_username}`,
        });
        
        // Reset form
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          admin_username: '',
          admin_pin: '',
          admin_name: '',
          subscription_plan: 'basic',
          max_doctors: 10,
          max_patients_per_day: 100
        });
      } else {
        setRegistrationStatus('error');
        setErrorMessage(result.error || 'Failed to register clinic');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error || 'Please try again',
        });
      }
    } catch (error) {
      setRegistrationStatus('error');
      setErrorMessage('Network error. Please try again.');
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Register New Clinic
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Join CuraFlow and start managing your clinic efficiently
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {registrationStatus === 'success' && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Clinic registered successfully! You can now login with your credentials.
              </AlertDescription>
            </Alert>
          )}

          {registrationStatus === 'error' && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Clinic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Clinic Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter clinic name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter clinic address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Admin Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Admin Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_username">Admin Username *</Label>
                  <Input
                    id="admin_username"
                    value={formData.admin_username}
                    onChange={(e) => handleInputChange('admin_username', e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin_pin">Admin PIN *</Label>
                  <Input
                    id="admin_pin"
                    value={formData.admin_pin}
                    onChange={(e) => handleInputChange('admin_pin', e.target.value)}
                    placeholder="4-digit PIN"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="admin_name">Admin Full Name *</Label>
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={(e) => handleInputChange('admin_name', e.target.value)}
                    placeholder="Enter admin full name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subscription Plan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Plan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription_plan">Plan</Label>
                  <select
                    id="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={(e) => handleInputChange('subscription_plan', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_doctors">Max Doctors</Label>
                  <Input
                    id="max_doctors"
                    type="number"
                    value={formData.max_doctors}
                    onChange={(e) => handleInputChange('max_doctors', parseInt(e.target.value))}
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
                    onChange={(e) => handleInputChange('max_patients_per_day', parseInt(e.target.value))}
                    min="10"
                    max="1000"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering Clinic...
                </>
              ) : (
                'Register Clinic'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have a clinic?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
