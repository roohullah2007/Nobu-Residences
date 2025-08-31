import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import axios from 'axios';

export default function ApiKeys({ title, api_keys, mls_settings, connection_status, status }) {
    const [showValues, setShowValues] = useState({});
    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState({});
    const [activeTab, setActiveTab] = useState('api_keys');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        // API Keys
        ampre_api_url: api_keys.ampre_api_url || '',
        ampre_vow_token: '',
        ampre_idx_token: '',
        google_maps_api_key: '',
        walkscore_api_key: '',
        
        // MLS Settings
        mls_auto_sync: mls_settings?.auto_sync ?? true,
        mls_sync_interval: mls_settings?.sync_interval ?? 60,
        mls_max_properties: mls_settings?.max_properties ?? 1000,
        mls_default_city: mls_settings?.default_city ?? 'Toronto',
        default_building_address: mls_settings?.default_building_address ?? '55 Mercer Street',
        cache_ttl: mls_settings?.cache_ttl ?? 300,
    });

    const toggleShowValue = (fieldName) => {
        setShowValues(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.api-keys.update'), {
            onSuccess: () => {
                reset('ampre_vow_token', 'ampre_idx_token', 'google_maps_api_key', 'walkscore_api_key');
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'configured': return 'text-green-600';
            case 'not_configured': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'configured': return 'Configured';
            case 'not_configured': return 'Not Configured';
            default: return 'Unknown';
        }
    };

    const testApiConnection = async (apiType) => {
        setTesting(prev => ({ ...prev, [apiType]: true }));
        setTestResults(prev => ({ ...prev, [apiType]: null }));

        try {
            const response = await axios.post(route('admin.api-keys.test'), {
                api_type: apiType
            });
            
            setTestResults(prev => ({ ...prev, [apiType]: response.data }));
        } catch (error) {
            setTestResults(prev => ({ 
                ...prev, 
                [apiType]: { 
                    success: false, 
                    message: error.response?.data?.message || 'Test failed' 
                } 
            }));
        } finally {
            setTesting(prev => ({ ...prev, [apiType]: false }));
        }
    };

    const apiKeysConfig = [
        {
            id: 'ampre_api_url',
            label: 'AMPRE API URL',
            type: 'url',
            description: 'The base URL for the AMPRE real estate API endpoint.',
            placeholder: 'https://query.ampre.ca/odata/',
            required: true,
            showToggle: false,
            currentValue: api_keys.ampre_api_url
        },
        {
            id: 'ampre_vow_token',
            label: 'AMPRE VOW Token',
            type: 'password',
            description: 'Virtual Office Website token for AMPRE API authentication.',
            placeholder: 'Enter your VOW token',
            required: true,
            showToggle: true,
            currentValue: api_keys.ampre_vow_token
        },
        {
            id: 'ampre_idx_token',
            label: 'AMPRE IDX Token',
            type: 'password',
            description: 'Internet Data Exchange token for additional AMPRE API features.',
            placeholder: 'Enter your IDX token',
            required: false,
            showToggle: true,
            currentValue: api_keys.ampre_idx_token
        },
        {
            id: 'google_maps_api_key',
            label: 'Google Maps API Key',
            type: 'password',
            description: 'API key for Google Maps integration and geocoding services.',
            placeholder: 'Enter your Google Maps API key',
            required: false,
            showToggle: true,
            currentValue: api_keys.google_maps_api_key
        },
        {
            id: 'walkscore_api_key',
            label: 'WalkScore API Key',
            type: 'password',
            description: 'API key for WalkScore integration to show walkability ratings.',
            placeholder: 'Enter your WalkScore API key',
            required: false,
            showToggle: true,
            currentValue: api_keys.walkscore_api_key
        }
    ];

    return (
        <AdminLayout title={title}>
            <div className="space-y-8">
                {/* Header */}
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            API Keys Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Configure your API credentials for AMPRE, Google Maps, and other services
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {status && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{status}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Connection Status Overview */}
                {connection_status && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">API Connection Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${connection_status.ampre_vow === 'configured' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-sm font-medium">AMPRE VOW</span>
                                <span className={`text-sm ${getStatusColor(connection_status.ampre_vow)}`}>
                                    {getStatusText(connection_status.ampre_vow)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${connection_status.ampre_idx === 'configured' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-sm font-medium">AMPRE IDX</span>
                                <span className={`text-sm ${getStatusColor(connection_status.ampre_idx)}`}>
                                    {getStatusText(connection_status.ampre_idx)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${connection_status.google_maps === 'configured' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-sm font-medium">Google Maps</span>
                                <span className={`text-sm ${getStatusColor(connection_status.google_maps)}`}>
                                    {getStatusText(connection_status.google_maps)}
                                </span>
                            </div>
                        </div>
                        {connection_status.last_test && (
                            <p className="text-sm text-gray-500 mt-4">
                                Last tested: {new Date(connection_status.last_test).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('api_keys')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'api_keys'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            API Keys
                        </button>
                        <button
                            onClick={() => setActiveTab('mls_settings')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'mls_settings'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            MLS Settings
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'api_keys' && (
                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="grid grid-cols-1 gap-6">
                                {apiKeysConfig.map((config) => (
                                    <div key={config.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <InputLabel htmlFor={config.id} value={config.label} className="font-semibold" />
                                            {config.required && (
                                                <span className="text-sm text-red-500">Required</span>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                                        
                                        {/* Current Value Display */}
                                        {config.currentValue && (
                                            <div className="bg-gray-50 rounded-md p-3 mb-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-600">Current:</span>
                                                        <code className="text-sm bg-gray-200 px-2 py-1 rounded font-mono">
                                                            {config.showToggle && !showValues[config.id] 
                                                                ? config.currentValue 
                                                                : config.currentValue
                                                            }
                                                        </code>
                                                    </div>
                                                    {config.showToggle && config.currentValue && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleShowValue(config.id)}
                                                            className="text-sm text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            {showValues[config.id] ? 'Hide' : 'Show'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="relative">
                                            <TextInput
                                                id={config.id}
                                                type={config.showToggle && showValues[config.id] ? 'text' : config.type}
                                                name={config.id}
                                                value={data[config.id]}
                                                className="block w-full"
                                                placeholder={config.placeholder}
                                                onChange={(e) => setData(config.id, e.target.value)}
                                            />
                                            {config.showToggle && (
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => toggleShowValue(config.id)}
                                                >
                                                    {showValues[config.id] ? (
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        
                                        <InputError message={errors[config.id]} className="mt-2" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Saving...' : 'Save API Keys'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* MLS Settings Tab */}
                {activeTab === 'mls_settings' && (
                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Auto Sync */}
                                <div className="space-y-2">
                                    <InputLabel htmlFor="mls_auto_sync" value="Auto Sync MLS" className="font-semibold" />
                                    <p className="text-sm text-gray-600 mb-2">Automatically synchronize properties from MLS API</p>
                                    <div className="flex items-center">
                                        <input
                                            id="mls_auto_sync"
                                            type="checkbox"
                                            checked={data.mls_auto_sync}
                                            onChange={(e) => setData('mls_auto_sync', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                        <label htmlFor="mls_auto_sync" className="ml-2 text-sm text-gray-700">
                                            Enable automatic MLS synchronization
                                        </label>
                                    </div>
                                    <InputError message={errors.mls_auto_sync} className="mt-2" />
                                </div>

                                {/* Sync Interval */}
                                <div className="space-y-2">
                                    <InputLabel htmlFor="mls_sync_interval" value="Sync Interval (minutes)" className="font-semibold" />
                                    <p className="text-sm text-gray-600 mb-2">How often to sync properties from MLS API (5-1440 minutes)</p>
                                    <TextInput
                                        id="mls_sync_interval"
                                        type="number"
                                        min="5"
                                        max="1440"
                                        value={data.mls_sync_interval}
                                        className="block w-full"
                                        placeholder="60"
                                        onChange={(e) => setData('mls_sync_interval', parseInt(e.target.value) || 60)}
                                    />
                                    <InputError message={errors.mls_sync_interval} className="mt-2" />
                                </div>

                                {/* Max Properties */}
                                <div className="space-y-2">
                                    <InputLabel htmlFor="mls_max_properties" value="Max Properties" className="font-semibold" />
                                    <p className="text-sm text-gray-600 mb-2">Maximum number of properties to sync (10-10,000)</p>
                                    <TextInput
                                        id="mls_max_properties"
                                        type="number"
                                        min="10"
                                        max="10000"
                                        value={data.mls_max_properties}
                                        className="block w-full"
                                        placeholder="1000"
                                        onChange={(e) => setData('mls_max_properties', parseInt(e.target.value) || 1000)}
                                    />
                                    <InputError message={errors.mls_max_properties} className="mt-2" />
                                </div>

                                {/* Default City */}
                                <div className="space-y-2">
                                    <InputLabel htmlFor="mls_default_city" value="Default City" className="font-semibold" />
                                    <p className="text-sm text-gray-600 mb-2">Default city for MLS property searches</p>
                                    <TextInput
                                        id="mls_default_city"
                                        type="text"
                                        value={data.mls_default_city}
                                        className="block w-full"
                                        placeholder="Toronto"
                                        onChange={(e) => setData('mls_default_city', e.target.value)}
                                    />
                                    <InputError message={errors.mls_default_city} className="mt-2" />
                                </div>

                                {/* Default Building Address */}
                                <div className="space-y-2">
                                    <InputLabel htmlFor="default_building_address" value="Default Building Address" className="font-semibold" />
                                    <p className="text-sm text-gray-600 mb-2">Default building address for homepage property listings (e.g., "55 Mercer Street")</p>
                                    <TextInput
                                        id="default_building_address"
                                        type="text"
                                        value={data.default_building_address}
                                        className="block w-full"
                                        placeholder="55 Mercer Street"
                                        onChange={(e) => setData('default_building_address', e.target.value)}
                                    />
                                    <InputError message={errors.default_building_address} className="mt-2" />
                                </div>

                                {/* Cache TTL */}
                                <div className="space-y-2">
                                    <InputLabel htmlFor="cache_ttl" value="Cache TTL (seconds)" className="font-semibold" />
                                    <p className="text-sm text-gray-600 mb-2">Cache time-to-live for API responses (60-3600 seconds)</p>
                                    <TextInput
                                        id="cache_ttl"
                                        type="number"
                                        min="60"
                                        max="3600"
                                        value={data.cache_ttl}
                                        className="block w-full"
                                        placeholder="300"
                                        onChange={(e) => setData('cache_ttl', parseInt(e.target.value) || 300)}
                                    />
                                    <InputError message={errors.cache_ttl} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-6 border-t border-gray-200">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Saving...' : 'Save MLS Settings'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* API Status */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            API Status & Testing
                        </h3>
                        <div className="space-y-4">
                            {/* AMPRE API */}
                            <div className="bg-gray-50 px-4 py-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            api_keys.ampre_vow_token ? 'bg-green-400' : 'bg-red-400'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">AMPRE API</p>
                                            <p className="text-sm text-gray-500">
                                                {api_keys.ampre_vow_token ? 'Connected' : 'Not configured'}
                                            </p>
                                        </div>
                                    </div>
                                    {api_keys.ampre_vow_token && (
                                        <SecondaryButton
                                            onClick={() => testApiConnection('ampre')}
                                            disabled={testing.ampre}
                                        >
                                            {testing.ampre ? 'Testing...' : 'Test Connection'}
                                        </SecondaryButton>
                                    )}
                                </div>
                                {testResults.ampre && (
                                    <div className={`mt-3 p-3 rounded text-sm ${
                                        testResults.ampre.success 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {testResults.ampre.message}
                                        {testResults.ampre.data && (
                                            <div className="mt-1 text-xs">
                                                Properties accessible: {testResults.ampre.data.property_count}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Google Maps API */}
                            <div className="bg-gray-50 px-4 py-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            api_keys.google_maps_api_key ? 'bg-green-400' : 'bg-yellow-400'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Google Maps</p>
                                            <p className="text-sm text-gray-500">
                                                {api_keys.google_maps_api_key ? 'Connected' : 'Optional'}
                                            </p>
                                        </div>
                                    </div>
                                    {api_keys.google_maps_api_key && (
                                        <SecondaryButton
                                            onClick={() => testApiConnection('google_maps')}
                                            disabled={testing.google_maps}
                                        >
                                            {testing.google_maps ? 'Testing...' : 'Test Connection'}
                                        </SecondaryButton>
                                    )}
                                </div>
                                {testResults.google_maps && (
                                    <div className={`mt-3 p-3 rounded text-sm ${
                                        testResults.google_maps.success 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {testResults.google_maps.message}
                                    </div>
                                )}
                            </div>

                            {/* WalkScore API */}
                            <div className="bg-gray-50 px-4 py-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            api_keys.walkscore_api_key ? 'bg-green-400' : 'bg-yellow-400'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">WalkScore</p>
                                            <p className="text-sm text-gray-500">
                                                {api_keys.walkscore_api_key ? 'Connected' : 'Optional'}
                                            </p>
                                        </div>
                                    </div>
                                    {api_keys.walkscore_api_key && (
                                        <SecondaryButton
                                            onClick={() => testApiConnection('walkscore')}
                                            disabled={testing.walkscore}
                                        >
                                            {testing.walkscore ? 'Testing...' : 'Test Connection'}
                                        </SecondaryButton>
                                    )}
                                </div>
                                {testResults.walkscore && (
                                    <div className={`mt-3 p-3 rounded text-sm ${
                                        testResults.walkscore.success 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {testResults.walkscore.message}
                                        {testResults.walkscore.data && (
                                            <div className="mt-1 text-xs">
                                                Toronto WalkScore: {testResults.walkscore.data.walkscore}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>AMPRE API:</strong> Contact your AMPRE provider for VOW and IDX tokens</li>
                                    <li><strong>Google Maps:</strong> Get your API key from the Google Cloud Console</li>
                                    <li><strong>WalkScore:</strong> Sign up at walkscore.com/professional/api</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}