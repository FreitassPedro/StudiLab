"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof formSchema>;

export default function SignInPage() {

    const router = useRouter();

    async function onSubmit(data: FormData) {
        console.log("Form submitted:", data);

        try {
            const { error } = await authClient.signIn.email({
                email: data.email,
                password: data.password
            });
            if (error) {
                toast.error(error.message || "Failed to sign in");
                return;
            }
            toast.success("Signed in successfully!");
            router.push("/");


        } catch (error) {
            toast.error("Unexpected error occurred");
            console.error("Unexpected error:", error);
        }

        return (
            <div>
                <h1>Sign In Page</h1>
                {/* Your sign-in form goes here */}
            </div>
        );
    }
};