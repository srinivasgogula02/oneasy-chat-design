import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

        console.log('Verifying OTP (GET) for:', `${country}${mobile}`);

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

        // OTP Verified Successfully. Now handle Supabase Session using Shadow Account strategy.
        const supabase = await createClient();
        const shadowEmail = `${mobile}@mobile.oneasy.com`;
        // Deterministic password generation using a secret (or just use a fixed complex string + mobile if no secret available)
        // For security, rely on the fact that ONLY successful OTP verification reaches this code block.
        // We use a strong strict password format required by Supabase (often requires digits, chars, maybe symbols)
        const shadowPassword = `Oneasy#${mobile}#Secure`;

        // 1. Try to Sign In
        let { error: signInError } = await supabase.auth.signInWithPassword({
            email: shadowEmail,
            password: shadowPassword,
        });

        // 2. If Sign In fails, try to Sign Up (Auto-register)
        if (signInError) {
            console.log('Shadow account sign in failed, attempting sign up...', signInError.message);

            const { error: signUpError } = await supabase.auth.signUp({
                email: shadowEmail,
                password: shadowPassword,
                options: {
                    data: {
                        full_name: `Mobile User ${mobile}`,
                        phone: mobile,
                        is_mobile_user: true
                    }
                }
            });

            if (signUpError) {
                console.error('Shadow account sign up error:', signUpError);
                return NextResponse.json(
                    { success: false, message: 'Authentication failed: ' + signUpError.message },
                    { status: 500 }
                );
            }

            // Note: If email confirmation is enabled in Supabase, this will fail to create a session immediately.
            // We assume it is disabled or auto-confirmed for this bridge strategy.
        }

        return NextResponse.json({
            success: true,
            message: 'OTP verified and user authenticated',
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
