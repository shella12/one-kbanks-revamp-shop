import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Save, X, User, Package, BarChart3, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import userService, { UpdateProfileData, UserProfile } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { OrdersList } from '@/components/orders/OrdersList';
import { ProfileStats } from '@/components/profile/ProfileStats';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editData, setEditData] = useState<UpdateProfileData>({
    name: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'orders') {
      setActiveTab('orders');
    } else if (tab === 'stats') {
      setActiveTab('stats');
    }
  }, [location.search]);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    enabled: !!user
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  });

  const handleEdit = () => {
    if (profile) {
      setEditData({
        name: profile.name,
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        }
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: '',
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="md:col-span-2 h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error loading profile</h2>
                <p className="text-gray-600">Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and view your order history</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Details */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave} 
                        size="sm"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium mt-1">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <p className="text-sm font-medium mt-1">{profile.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editData.phoneNumber}
                        onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{profile.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label>Address</Label>
                    <div className="mt-2 space-y-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        {isEditing ? (
                          <Input
                            id="street"
                            value={editData.address?.street || ''}
                            onChange={(e) => setEditData({
                              ...editData,
                              address: { ...editData.address!, street: e.target.value }
                            })}
                          />
                        ) : (
                          <p className="text-sm font-medium mt-1">
                            {profile.address?.street || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          {isEditing ? (
                            <Input
                              id="city"
                              value={editData.address?.city || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                address: { ...editData.address!, city: e.target.value }
                              })}
                            />
                          ) : (
                            <p className="text-sm font-medium mt-1">
                              {profile.address?.city || 'Not provided'}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          {isEditing ? (
                            <Input
                              id="state"
                              value={editData.address?.state || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                address: { ...editData.address!, state: e.target.value }
                              })}
                            />
                          ) : (
                            <p className="text-sm font-medium mt-1">
                              {profile.address?.state || 'Not provided'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country">Country</Label>
                          {isEditing ? (
                            <Input
                              id="country"
                              value={editData.address?.country || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                address: { ...editData.address!, country: e.target.value }
                              })}
                            />
                          ) : (
                            <p className="text-sm font-medium mt-1">
                              {profile.address?.country || 'Not provided'}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          {isEditing ? (
                            <Input
                              id="zipCode"
                              value={editData.address?.zipCode || ''}
                              onChange={(e) => setEditData({
                                ...editData,
                                address: { ...editData.address!, zipCode: e.target.value }
                              })}
                            />
                          ) : (
                            <p className="text-sm font-medium mt-1">
                              {profile.address?.zipCode || 'Not provided'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersList />
          </TabsContent>

          <TabsContent value="stats">
            <ProfileStats />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;