import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UsersTable } from '@/components/admin/UsersTable';
import { Search, Filter, Users as UsersIcon } from 'lucide-react';
import adminService, { UserFilters } from '@/services/admin.service';
import { useAuth } from '@/context/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => adminService.getUsers(filters),
  });

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  const handleRoleFilter = (role: string) => {
    setFilters({ 
      ...filters, 
      role: role === 'all' ? undefined : role as 'user' | 'admin',
      page: 1 
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UsersIcon className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {usersData?.pagination.total || 0} users
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <Select onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : usersData?.users.length ? (
            <>
              <UsersTable 
                users={usersData.users} 
                currentUserId={currentUser?.id || ''} 
              />
              
              {/* Pagination */}
              {usersData.pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: usersData.pagination.pages }, (_, i) => i + 1)
                        .filter(page => {
                          const current = filters.page || 1;
                          return page === 1 || page === usersData.pagination.pages || 
                                 (page >= current - 2 && page <= current + 2);
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === filters.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      disabled={filters.page === usersData.pagination.pages}
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;