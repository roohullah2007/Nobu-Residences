import { useState, useCallback } from 'react';
import axios from 'axios';

export const usePropertyAiDescription = () => {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState(null);
    const [faqs, setFaqs] = useState(null);
    const [error, setError] = useState(null);

    const generateDescription = useCallback(async (mlsId, forceRegenerate = false) => {
        console.log('🤖 Generating AI description for MLS:', mlsId);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/property-ai/generate-description', {
                mls_id: mlsId,
                force_regenerate: forceRegenerate
            }, {
                timeout: 60000 // 60 second timeout for AI generation (Gemini can be slow)
            });

            if (response.data.success) {
                console.log('✅ 🤖 AI description generated successfully');
                setDescription(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to generate description');
            }
        } catch (err) {
            console.error('❌ 🤖 Error generating AI description:', err.message);
            setError(err.response?.data?.error || err.message || 'Failed to generate AI description');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const generateFaqs = useCallback(async (mlsId, forceRegenerate = false) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/property-ai/generate-faqs', {
                mls_id: mlsId,
                force_regenerate: forceRegenerate
            });

            if (response.data.success) {
                setFaqs(response.data.data.faqs);
                return response.data.data.faqs;
            } else {
                throw new Error(response.data.error || 'Failed to generate FAQs');
            }
        } catch (err) {
            console.error('Error generating AI FAQs:', err);
            setError(err.message || 'Failed to generate AI FAQs');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllContent = useCallback(async (mlsId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/property-ai/content', {
                params: { mls_id: mlsId },
                timeout: 5000 // 5 second timeout for fetching existing content
            });

            if (response.data.success) {
                const { description: desc, faqs: faqList } = response.data.data;
                console.log('✅ 🤖 Found existing AI content');
                setDescription(desc);
                setFaqs(faqList);
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to fetch AI content');
            }
        } catch (err) {
            if (err.response?.status === 404) {
                // No existing content found - this is normal for new properties
                setError(null);
                return null;
            }

            console.error('❌ 🤖 Error fetching AI content:', err.message);
            setError(err.response?.data?.error || err.message || 'Failed to fetch AI content');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearContent = useCallback(() => {
        setDescription(null);
        setFaqs(null);
        setError(null);
    }, []);

    return {
        loading,
        description,
        faqs,
        error,
        generateDescription,
        generateFaqs,
        getAllContent,
        clearContent,
        setDescription
    };
};

export default usePropertyAiDescription;