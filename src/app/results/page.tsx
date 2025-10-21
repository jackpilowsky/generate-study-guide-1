'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Results() {
    const [studyGuide, setStudyGuide] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [interviewDate, setInterviewDate] = useState('');

    const router = useRouter();

    useEffect(() => {
        // Get data from sessionStorage
        const storedDate = sessionStorage.getItem('interviewDate');
        const storedDescription = sessionStorage.getItem('jobDescription');

        if (!storedDate || !storedDescription) {
            router.push('/');
            return;
        }

        setInterviewDate(storedDate);

        // Calculate days until interview
        const today = new Date();
        const interview = new Date(storedDate);
        const timeDiff = interview.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Generate the study guide
        generateStudyGuide(daysDiff, storedDescription);
    }, [router]);

    const generateStudyGuide = async (daysUntilInterview: number, description: string) => {
        try {
            const prompt = `Based on the following job description, prepare a list of free online resources, specifically video tutorials and classes, that could help me prepare for a technical interview in the next ${daysUntilInterview} days. Focus on advanced and intermediate resources: ${description}`;

            const response = await fetch('/api/generate-study-guide', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate study guide');
            }

            const data = await response.json();
            setStudyGuide(data.studyGuide);
        } catch (err) {
            setError('Failed to generate study guide. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Generating your personalized study guide...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        ← Back to Form
                    </button>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Your Personalized Study Guide
                        </h1>
                        <p className="text-gray-600">
                            Interview Date: {new Date(interviewDate).toLocaleDateString()}
                        </p>
                    </div>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-800">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-red-600 hover:text-red-800 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                {studyGuide}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}