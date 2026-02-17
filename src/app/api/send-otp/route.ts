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

        const authkey = process.env.MSG91_AUTHKEY?.trim();
        const templateId = process.env.MSG91_TEMPLATE_ID?.trim();
        const sender = process.env.MSG91_SENDER_ID?.trim();
        const country = (process.env.MSG91_COUNTRY_CODE || '91').trim();

        if (!authkey || !templateId || !sender) {
            console.error("Missing MSG91 Environment Variables", { authkey: !!authkey, templateId: !!templateId, sender: !!sender });
            return NextResponse.json(
                { success: false, message: 'Server misconfiguration: Missing MSG91 credentials' },
                { status: 500 }
            );
        }

        // Validate mobile number (10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            return NextResponse.json(
                { success: false, message: 'Invalid mobile number. Please enter a 10-digit number.' },
                { status: 400 }
            );
        }

        // MSG91 SendOTP API (classic route)
        // Some docs suggest /api/v5/otp?template_id=&mobile=&authkey=... for GET
        // For POST, we stick to current url.
        const url = `https://control.msg91.com/api/v5/otp?authkey=${authkey}`;

        // Ensure distinct country code and mobile
        // If mobile is just 10 digits, prefix with country.
        // If mobile already has country code, handle it? app sends 10 digits.
        const fullMobile = `${country}${mobile}`;

        console.log('Sending OTP Payload:', {
            template_id: templateId,
            mobile: fullMobile,
            sender,
            otp_length: 6
        });

        const payload = {
            template_id: templateId,
            mobile: fullMobile,
            sender,
            otp_length: 6,
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Authkey can be in header or params. Putting in params is safer for v5 sometimes.
                // Keeping it in headers too just in case.
                authkey,
            },
            body: JSON.stringify(payload),
        });

        const responseText = await res.text();
        console.log('MSG91 Raw Response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse MSG91 response as JSON", e);
            return NextResponse.json({ success: false, message: 'MSG91 returned non-JSON response: ' + responseText }, { status: 502 });
        }

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: data?.message || 'Failed to send OTP (MSG91 Error)' },
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
            { success: false, message: 'Server error while sending OTP: ' + (error.message || error) },
            { status: 500 }
        );
    }
}
