import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { mobile, otp } = await req.json();

        if (!mobile || !otp) {
            return NextResponse.json(
                { success: false, message: 'Mobile and OTP are required' },
                { status: 400 }
            );
        }

        const authkey = process.env.MSG91_AUTHKEY!;
        const country = process.env.MSG91_COUNTRY_CODE || '91';

        // MSG91 Verify OTP API (v5 uses GET with query params)
        const url = `https://control.msg91.com/api/v5/otp/verify?mobile=${country}${mobile}&otp=${otp}`;

        console.log('Verifying OTP (GET) for:', `${country}${mobile}`, 'OTP:', otp);

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                authkey,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();
        console.log('MSG91 Verify Response:', data);

        if (!res.ok || data?.type === 'error') {
            return NextResponse.json(
                { success: false, message: data?.message || 'Invalid OTP' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            data,
        });
    } catch (error: any) {
        console.error('Verify OTP error', error);
        return NextResponse.json(
            { success: false, message: 'Server error while verifying OTP' },
            { status: 500 }
        );
    }
}
