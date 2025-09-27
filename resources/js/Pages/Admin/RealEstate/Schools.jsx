import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';

export default function Schools({ auth, schools: initialSchools = [], pagination = null }) {
  const [schools, setSchools] = useState(initialSchools);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    school_type: '',
    grade_level: '',
    city: ''
  });

  const { delete: deleteSchool } = useForm();

  // Fetch schools with filters
  const fetchSchools = async (newFilters = filters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/schools?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setSchools(result.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchSchools(newFilters);
  };

  // Handle school deletion
  const handleDeleteSchool = (schoolId, schoolName) => {
    if (confirm(`Are you sure you want to delete "${schoolName}"? This action cannot be undone.`)) {
      deleteSchool(`/admin/schools/${schoolId}`, {
        onSuccess: () => {
          setSchools(schools.filter(s => s.id !== schoolId));
        }
      });
    }
  };

  // Handle batch geocoding
  const handleBatchGeocode = async () => {
    if (confirm('This will geocode schools that don\'t have coordinates. Continue?')) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/schools/batch-geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          }
        });
        const result = await response.json();
        
        if (result.success) {
          alert(result.message);
          fetchSchools(); // Refresh the list
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error in batch geocoding:', error);
        alert('Error during batch geocoding');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AdminLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">School Management</h2>}
    >
      <Head title="Schools - Admin" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              
              {/* Header Actions */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Schools</h3>
                <div className="flex gap-3">
                  <SecondaryButton
                    onClick={handleBatchGeocode}
                    disabled={isLoading}
                  >
                    Batch Geocode
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => router.visit('/admin/schools/create')}
                  >
                    Add School
                  </PrimaryButton>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search schools..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                  <select
                    value={filters.school_type}
                    onChange={(e) => handleFilterChange('school_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="public">Public</option>
                    <option value="catholic">Catholic</option>
                    <option value="private">Private</option>
                    <option value="charter">Charter</option>
                    <option value="french">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    value={filters.grade_level}
                    onChange={(e) => handleFilterChange('grade_level', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Grades</option>
                    <option value="elementary">Elementary</option>
                    <option value="secondary">Secondary</option>
                    <option value="k-12">K-12</option>
                    <option value="preschool">Preschool</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="City..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {/* Schools Table */}
              {!isLoading && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No schools found. <Link href="/admin/schools/create" className="text-indigo-600 hover:underline">Add the first school</Link>
                          </td>
                        </tr>
                      ) : (
                        schools.map((school) => (
                          <tr key={school.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    <Link 
                                      href={`/admin/schools/${school.id}`}
                                      className="hover:text-indigo-600"
                                    >
                                      {school.name}
                                    </Link>
                                  </div>
                                  <div className="text-sm text-gray-500">{school.slug}</div>
                                  {school.is_featured && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                      Featured
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{school.school_type_label}</div>
                              <div className="text-sm text-gray-500">{school.grade_level_label}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{school.address}</div>
                              <div className="text-sm text-gray-500">{school.city}, {school.province}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {school.phone && (
                                <div className="text-sm text-gray-900">{school.phone}</div>
                              )}
                              {school.email && (
                                <div className="text-sm text-gray-500">{school.email}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {school.latitude && school.longitude ? (
                                <div className="text-xs text-green-600">
                                  ✓ {Number(school.latitude).toFixed(4)}, {Number(school.longitude).toFixed(4)}
                                </div>
                              ) : (
                                <div className="text-xs text-red-600">No coordinates</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link
                                  href={`/admin/schools/${school.id}/edit`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDeleteSchool(school.id, school.name)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} schools
                  </div>
                  <div className="flex space-x-2">
                    {pagination.current_page > 1 && (
                      <button
                        onClick={() => fetchSchools({ ...filters, page: pagination.current_page - 1 })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    {pagination.current_page < pagination.last_page && (
                      <button
                        onClick={() => fetchSchools({ ...filters, page: pagination.current_page + 1 })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}