'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [interviewDate, setInterviewDate] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!interviewDate || !jobDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Store data in sessionStorage and navigate to results page
    sessionStorage.setItem('interviewDate', interviewDate);
    sessionStorage.setItem('jobDescription', jobDescription);
    router.push('/results');
  };

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Coding Interview Prep Study Guide Generator
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Get personalized study resources based on your job description and interview timeline
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="interview-date" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Interview
              </label>
              <input
                type="date"
                id="interview-date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={getTomorrowDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
                Copy Job Description Here
              </label>
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Paste the complete job description here..."
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-lg transition-colors"
              >
                Generate Study Guide
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
