"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { type ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
    pendingText?: string;
};

export function SubmitButton({ children, pendingText, className, ...props }: Props) {
    const { pending } = useFormStatus();

    return (
        <button
            {...props}
            type="submit"
            aria-disabled={pending}
            disabled={pending}
            className={`flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {pendingText || "Please wait..."}
                </>
            ) : (
                children
            )}
        </button>
    );
}
