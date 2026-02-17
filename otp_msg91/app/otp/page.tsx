'use client';

import React, { useState } from 'react';

export default function OtpPage() {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'ENTER_MOBILE' | 'ENTER_OTP'>('ENTER_MOBILE');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const sendOtp = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setMessage(data.message || 'Failed to send OTP');
                return;
            }

            setMessage('OTP sent successfully');
            setStep('ENTER_OTP');
        } catch (err: any) {
            setMessage('Something went wrong while sending OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile, otp }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setMessage(data.message || 'Invalid OTP');
                return;
            }

            setMessage('OTP verified! User is authenticated.');
            // here you can set a cookie, JWT, or session
        } catch (err: any) {
            setMessage('Something went wrong while verifying OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1 className="text-2xl font-bold mb-4">Mobile OTP Login</h1>

            {step === 'ENTER_MOBILE' && (
                <>
                    <label className="block mb-2">
                        Mobile number (without country code)
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="9876543210"
                            className="block w-full mt-2 p-2 border rounded"
                        />
                    </label>
                    <button
                        onClick={sendOtp}
                        disabled={loading || !mobile}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </>
            )}

            {step === 'ENTER_OTP' && (
                <>
                    <p className="mb-4">OTP sent to +91{mobile}. Enter it below.</p>
                    <label className="block mb-2">
                        OTP
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="block w-full mt-2 p-2 border rounded"
                        />
                    </label>
                    <button
                        onClick={verifyOtp}
                        disabled={loading || !otp}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <button
                        onClick={sendOtp}
                        disabled={loading}
                        className="mt-2 ml-2 px-4 py-2 bg-gray-200 rounded"
                    >
                        Resend OTP
                    </button>
                </>
            )}

            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}
