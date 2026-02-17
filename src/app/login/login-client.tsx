'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginClient({ signInAction }: { signInAction: (formData: FormData) => Promise<void> }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const message = searchParams.get('message');

    const [isMobileLogin, setIsMobileLogin] = useState(true);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState<'ENTER_MOBILE' | 'ENTER_OTP'>('ENTER_MOBILE');
    const [loading, setLoading] = useState(false);
    const [localMessage, setLocalMessage] = useState<string | null>(null);

    const handleSendOtp = async () => {
        setLoading(true);
        setLocalMessage(null);
        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setLocalMessage(data.message || 'Failed to send OTP');
            } else {
                setLocalMessage('OTP sent successfully');
                setOtpStep('ENTER_OTP');
            }
        } catch (err: any) {
            console.error("Send OTP Client Error:", err);
            setLocalMessage(err.message || 'Something went wrong while sending OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setLocalMessage(null);
        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setLocalMessage(data.message || 'Invalid OTP');
            } else {
                setLocalMessage('OTP verified! Logging in...');
                // The API route handles the session creation via shadow account.
                // We just need to refresh/redirect.
                router.refresh();
                router.push('/chat');
            }
        } catch (err: any) {
            setLocalMessage('Something went wrong while verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex border-b border-gray-300 mb-4">
                <button
                    className={`flex-1 py-2 text-center ${!isMobileLogin ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                    onClick={() => setIsMobileLogin(false)}
                >
                    Email Login
                </button>
                <button
                    className={`flex-1 py-2 text-center ${isMobileLogin ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                    onClick={() => setIsMobileLogin(true)}
                >
                    Mobile Login
                </button>
            </div>

            {!isMobileLogin ? (
                <form
                    className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
                    action={signInAction}
                >
                    <label className="text-md" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mb-6"
                        name="email"
                        placeholder="you@example.com"
                        required
                    />
                    <label className="text-md" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mb-6"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                    <SubmitButton className="mb-2" pendingText="Signing In...">
                        Sign In
                    </SubmitButton>
                    <div className="text-center text-sm">
                        Don't have an account? <Link href="/signup" className="underline">Sign Up</Link>
                    </div>
                </form>
            ) : (
                <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                    {otpStep === 'ENTER_MOBILE' && (
                        <>
                            <label className="text-md" htmlFor="mobile">
                                Mobile Number
                            </label>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-3 py-2 bg-gray-100 border rounded-md text-gray-500 select-none">+91</span>
                                <input
                                    className="flex-1 rounded-md px-4 py-2 bg-inherit border"
                                    type="tel"
                                    name="mobile"
                                    placeholder="9876543210"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                onClick={handleSendOtp}
                                disabled={loading || mobile.length < 10}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 mb-2 w-full flex items-center justify-center font-medium disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </>
                    )}

                    {otpStep === 'ENTER_OTP' && (
                        <>
                            <p className="text-sm text-gray-600 mb-2">OTP sent to +91 {mobile}</p>
                            <label className="text-md" htmlFor="otp">
                                Enter OTP
                            </label>
                            <input
                                className="rounded-md px-4 py-2 bg-inherit border mb-6"
                                type="text"
                                name="otp"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length < 4}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 mb-2 w-full flex items-center justify-center font-medium disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <button
                                onClick={() => setOtpStep('ENTER_MOBILE')}
                                className="text-sm text-gray-500 underline text-center mt-2"
                            >
                                Change Number
                            </button>
                        </>
                    )}
                </div>
            )}

            {localMessage && (
                <p className={`mt-4 p-4 text-center ${localMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {localMessage}
                </p>
            )}

            {message && !localMessage && (
                <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                    {message}
                </p>
            )}
        </div>
    );
}
