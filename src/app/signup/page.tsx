
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { SubmitButton } from '@/components/submit-button'

export default async function Signup({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    const signUp = async (formData: FormData) => {
        'use server'

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const supabase = await createClient()
        const headersList = await headers()
        const origin = headersList.get('origin')

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            // If user already exists, try to sign them in immediately
            if (error.message.includes("already registered")) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (signInError) {
                    return redirect(`/login?message=${encodeURIComponent("User already exists. Please sign in with the correct password.")}`)
                }
                return redirect('/chat')
            }
            return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
        }

        if (data.session) {
            return redirect('/chat')
        }

        return redirect('/signup?message=Check email to continue sign in process')
    }

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto h-screen">
            <Link
                href="/"
                className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                >
                    <polyline points="15 18 9 12 15 6" />
                </svg>{' '}
                Back
            </Link>

            <form
                className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
                action={signUp}
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
                <SubmitButton className="mb-2" pendingText="Signing Up...">
                    Sign Up
                </SubmitButton>
                <div className="text-center text-sm">
                    Already have an account? <Link href="/login" className="underline">Sign In</Link>
                </div>

                {message && (
                    <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
                        {message}
                    </p>
                )}
            </form>
        </div>
    )
}
