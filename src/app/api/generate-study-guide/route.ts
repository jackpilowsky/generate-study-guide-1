import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const openaiApiKey = process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates comprehensive study guides for technical interviews. Provide specific, actionable resources with links when possible.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to generate study guide' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const studyGuide = data.choices[0]?.message?.content || 'No study guide generated';

        return NextResponse.json({ studyGuide });
    } catch (error) {
        console.error('Error generating study guide:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}