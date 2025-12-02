import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  industry: string;
  interests: string[];
  eventName: string;
  howDidYouHear: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactFormData = await req.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.company) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add additional metadata for tracking
    const enhancedData = {
      ...body,
      submissionType: 'expo360-signup',
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent') || '',
      referer: req.headers.get('referer') || '',
    };

    // Get N8N webhook URL from environment variables
    const webhookUrl = process.env.N8N_EXPO360_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_EXPO360_WEBHOOK_URL environment variable is not configured');
      return NextResponse.json(
        { success: false, message: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    console.log('Forwarding Expo 360 signup data to N8N webhook:', enhancedData);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enhancedData)
    });

    // Check if the N8N webhook responded successfully
    if (!response.ok) {
      console.error('Error forwarding Expo 360 signup to N8N webhook:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, message: 'Failed to submit to webhook' },
        { status: 500 }
      );
    }

    // Try to parse response from N8N (some webhooks return JSON, others just 200 OK)
    let result;
    try {
      result = await response.json();
    } catch {
      // If response is not JSON, that's okay for webhooks
      result = { status: 'success' };
    }

    // Log successful submission
    console.log('Expo 360 signup successfully submitted to N8N:', {
      email: body.email,
      company: body.company,
      eventName: body.eventName,
      industry: body.industry
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Expo 360 signup successfully submitted', 
      data: result 
    });
  } catch (error) {
    console.error('Expo 360 signup API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during Expo 360 signup submission' },
      { status: 500 }
    );
  }
}
