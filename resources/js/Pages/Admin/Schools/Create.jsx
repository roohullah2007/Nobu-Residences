import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function CreateSchool({ auth }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    address: '',
    city: '',
    province: 'ON',
    postal_code: '',
    phone: '',
    email: '',
    website_url: '',
    school_type: 'public',
    grade_level: 'elementary',
    school_board: '',
    principal_name: '',
    student_capacity: '',
    established_year: '',
    rating: '',
    description: '',
    is_featured: false
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.schools.store'));
  };

  return (
    <AdminLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add New School</h2>}
    >
      <Head title="Add School - Admin" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <form onSubmit={submit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <InputLabel htmlFor="name" value="School Name" />
                    <TextInput
                      id="name"
                      type="text"
                      name="name"
                      value={data.name}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('name', e.target.value)}
                      required
                    />
                    <InputError message={errors.name} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="school_type" value="School Type" />
                    <select
                      id="school_type"
                      name="school_type"
                      value={data.school_type}
                      onChange={(e) => setData('school_type', e.target.value)}
                      className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                      required
                    >
                      <option value="public">Public</option>
                      <option value="catholic">Catholic</option>
                      <option value="private">Private</option>
                      <option value="charter">Charter</option>
                      <option value="french">French</option>
                      <option value="other">Other</option>
                    </select>
                    <InputError message={errors.school_type} className="mt-2" />
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <InputLabel htmlFor="address" value="Address" />
                  <TextInput
                    id="address"
                    type="text"
                    name="address"
                    value={data.address}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('address', e.target.value)}
                    required
                  />
                  <InputError message={errors.address} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <InputLabel htmlFor="city" value="City" />
                    <TextInput
                      id="city"
                      type="text"
                      name="city"
                      value={data.city}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('city', e.target.value)}
                      required
                    />
                    <InputError message={errors.city} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="province" value="Province" />
                    <TextInput
                      id="province"
                      type="text"
                      name="province"
                      value={data.province}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('province', e.target.value)}
                      required
                    />
                    <InputError message={errors.province} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel htmlFor="postal_code" value="Postal Code" />
                    <TextInput
                      id="postal_code"
                      type="text"
                      name="postal_code"
                      value={data.postal_code}
                      className="mt-1 block w-full"
                      onChange={(e) => setData('postal_code', e.target.value)}
                    />
                    <InputError message={errors.postal_code} className="mt-2" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <InputLabel htmlFor="description" value="Description" />
                  <textarea
                    id="description"
                    name="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    placeholder="Brief description of the school..."
                  />
                  <InputError message={errors.description} className="mt-2" />
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center">
                  <input
                    id="is_featured"
                    name="is_featured"
                    type="checkbox"
                    checked={data.is_featured}
                    onChange={(e) => setData('is_featured', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                    Featured School
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                  <SecondaryButton
                    type="button"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </SecondaryButton>
                  
                  <PrimaryButton disabled={processing}>
                    {processing ? 'Creating...' : 'Create School'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
