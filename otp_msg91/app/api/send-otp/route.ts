import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const authkey = process.env.MSG91_AUTHKEY!.trim();
    const templateId = process.env.MSG91_TEMPLATE_ID!.trim();
    const sender = process.env.MSG91_SENDER_ID!.trim();
    const country = (process.env.MSG91_COUNTRY_CODE || '91').trim();

    console.log(`Debug Env: TemplateID Length: ${templateId.length}, Sender: ${sender}`);

    // MSG91 SendOTP API (classic route)
    const url = `https://control.msg91.com/api/v5/otp`;

    console.log('Sending OTP to:', `${country}${mobile}`, 'Template:', templateId);

    // Make sure to match the payload structure required by MSG91 v5 API
    // If using 'otp' (custom OTP), include it. If purely auto-gen via template, omit it or use 'otp_length'.
    // The user example had 'otp_length: 6' which implies MSG91 generates it.
    const payload = {
      template_id: templateId,
      mobile: `${country}${mobile}`,
      sender,
      otp_length: 6,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        authkey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('MSG91 Send Response:', data);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Failed to send OTP' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data,
    });
  } catch (error: any) {
    console.error('Send OTP error', error);
    return NextResponse.json(
      { success: false, message: 'Server error while sending OTP' },
      { status: 500 }
    );
  }
}
