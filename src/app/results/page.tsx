'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import jsPDF from 'jspdf';

export default function Results() {
    const [studyGuide, setStudyGuide] = useState('');
    const [studyGuideHTML, setStudyGuideHTML] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);

    // Convert markdown to sanitized HTML
    const convertMarkdownToHTML = async (markdown: string): Promise<string> => {
        const rawHTML = await marked(markdown);
        return DOMPurify.sanitize(rawHTML);
    };

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

    // Convert markdown to HTML when studyGuide changes
    useEffect(() => {
        if (studyGuide) {
            convertMarkdownToHTML(studyGuide).then(setStudyGuideHTML);
        }
    }, [studyGuide]);

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

    const downloadPDF = async () => {
        if (!studyGuide) return;

        setDownloadingPDF(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // Add title
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Your Personalized Study Guide', margin, yPosition);
            yPosition += 10;

            // Add interview date
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Interview Date: ${new Date(interviewDate).toLocaleDateString()}`, margin, yPosition);
            yPosition += 15;

            // Parse the HTML content to extract text and links
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = studyGuideHTML;

            // Simple text extraction with basic formatting
            const extractTextContent = (element: Element): string => {
                let text = '';
                for (const node of Array.from(element.childNodes)) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        text += node.textContent || '';
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        if (el.tagName === 'A') {
                            text += `${el.textContent} (${el.getAttribute('href')})`;
                        } else {
                            text += extractTextContent(el);
                        }
                    }
                }
                return text;
            };

            // Process each element
            for (const element of Array.from(tempDiv.children)) {
                if (yPosition > pageHeight - margin - 20) {
                    pdf.addPage();
                    yPosition = margin;
                }

                const tagName = element.tagName.toLowerCase();
                const text = extractTextContent(element);

                if (!text.trim()) continue;

                switch (tagName) {
                    case 'h1':
                    case 'h2':
                        pdf.setFontSize(16);
                        pdf.setFont('helvetica', 'bold');
                        const h2Lines = pdf.splitTextToSize(text, maxWidth);
                        pdf.text(h2Lines, margin, yPosition);
                        yPosition += h2Lines.length * 8 + 5;
                        break;

                    case 'h3':
                    case 'h4':
                        pdf.setFontSize(14);
                        pdf.setFont('helvetica', 'bold');
                        const h3Lines = pdf.splitTextToSize(text, maxWidth);
                        pdf.text(h3Lines, margin, yPosition);
                        yPosition += h3Lines.length * 7 + 4;
                        break;

                    case 'ul':
                    case 'ol':
                        const listItems = element.querySelectorAll('li');
                        listItems.forEach((li, index) => {
                            if (yPosition > pageHeight - margin - 10) {
                                pdf.addPage();
                                yPosition = margin;
                            }

                            pdf.setFontSize(11);
                            pdf.setFont('helvetica', 'normal');
                            const bullet = tagName === 'ul' ? '• ' : `${index + 1}. `;
                            const liText = extractTextContent(li);
                            const liLines = pdf.splitTextToSize(bullet + liText, maxWidth - 5);
                            pdf.text(liLines, margin + 5, yPosition);
                            yPosition += liLines.length * 6 + 2;
                        });
                        yPosition += 5;
                        break;

                    default:
                        pdf.setFontSize(11);
                        pdf.setFont('helvetica', 'normal');
                        const pLines = pdf.splitTextToSize(text, maxWidth);
                        pdf.text(pLines, margin, yPosition);
                        yPosition += pLines.length * 6 + 4;
                        break;
                }
            }

            const fileName = `study-guide-${new Date(interviewDate).toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingPDF(false);
        }
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
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    .study-guide-content a {
                        color: #2563eb !important;
                        font-weight: 500 !important;
                        text-decoration: underline !important;
                        text-decoration-thickness: 2px !important;
                        text-underline-offset: 2px !important;
                        transition: all 0.2s ease !important;
                    }
                    .study-guide-content a:hover {
                        color: #1d4ed8 !important;
                        text-decoration-color: #1d4ed8 !important;
                        background-color: #eff6ff !important;
                        padding: 1px 2px !important;
                        border-radius: 2px !important;
                    }
                `
            }} />
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            ← Back to Form
                        </button>

                        {!loading && !error && studyGuideHTML && (
                            <button
                                onClick={downloadPDF}
                                disabled={downloadingPDF}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloadingPDF ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        Download as PDF
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div ref={contentRef} className="bg-white shadow-lg rounded-lg p-8">
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
                                <div
                                    className="study-guide-content text-gray-800 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: studyGuideHTML }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}