import { useState, useCallback } from 'react';
import axios from 'axios';

export const usePropertyAiDescription = () => {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState(null);
    const [faqs, setFaqs] = useState(null);
    const [error, setError] = useState(null);

    const generateDescription = useCallback(async (mlsId, forceRegenerate = false) => {
        console.log('🤖 Generating AI description...');

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
                console.log('✅ AI description generated');
                setDescription(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to generate description');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to generate AI description');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const generateFaqs = useCallback(async (mlsId, forceRegenerate = false) => {
        console.log('🤖 Generating AI FAQs...');
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/property-ai/generate-faqs', {
                mls_id: mlsId,
                force_regenerate: forceRegenerate
            }, {
                timeout: 60000 // 60 second timeout for AI generation
            });

            if (response.data.success && response.data.data.faqs) {
                console.log(`✅ AI FAQs generated (${response.data.data.faqs.length} questions)`);
                setFaqs(response.data.data.faqs);
                return response.data.data.faqs;
            } else {
                throw new Error(response.data.error || 'Failed to generate FAQs');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to generate AI FAQs');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAllContent = useCallback(async (mlsId) => {
        try {
            const response = await axios.get('/api/property-ai/content', {
                params: { mls_id: mlsId },
                timeout: 10000 // 10 second timeout for fetching existing content
            });

            if (response.data.success) {
                const { description: desc, faqs: faqList } = response.data.data;
                setDescription(desc);
                setFaqs(faqList);
                return response.data.data;
            }
            return null;
        } catch (err) {
            // Silently handle errors - this is expected for new properties
            if (err.response?.status !== 404) {
                // Only log non-404 errors
                console.error('Error fetching AI content');
            }
            return null;
        }
    }, []);

    const clearContent = useCallback(() => {
        setDescription(null);
        setFaqs(null);
        setError(null);
    }, []);

    const generateDescriptionAndFaqs = useCallback(async (mlsId, forceRegenerate = false) => {
        console.log('🤖 Generating AI content...');
        setLoading(true);
        setError(null);

        try {
            // Generate both in parallel for better performance
            const [descResponse, faqResponse] = await Promise.all([
                axios.post('/api/property-ai/generate-description', {
                    mls_id: mlsId,
                    force_regenerate: forceRegenerate
                }, {
                    timeout: 60000
                }),
                axios.post('/api/property-ai/generate-faqs', {
                    mls_id: mlsId,
                    force_regenerate: forceRegenerate
                }, {
                    timeout: 60000
                })
            ]);

            let success = true;
            let descData = null;
            let faqData = null;

            if (descResponse.data.success) {
                console.log('✅ AI description ready');
                descData = descResponse.data.data;
                setDescription(descData);
            } else {
                success = false;
            }

            if (faqResponse.data.success && faqResponse.data.data.faqs) {
                console.log(`✅ AI FAQs ready (${faqResponse.data.data.faqs.length} questions)`);
                faqData = faqResponse.data.data.faqs;
                setFaqs(faqData);
                // Log the FAQ questions for verification
                faqResponse.data.data.faqs.forEach((faq, index) => {
                    console.log(`   ${index + 1}. ${faq.question}`);
                });
            } else {
                success = false;
            }

            return { description: descData, faqs: faqData, success };
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to generate AI content');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        description,
        faqs,
        error,
        generateDescription,
        generateFaqs,
        generateDescriptionAndFaqs,
        getAllContent,
        clearContent,
        setDescription
    };
};

export default usePropertyAiDescription;