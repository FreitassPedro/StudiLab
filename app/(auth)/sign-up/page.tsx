"use client";

import FormLayout from "@/components/layout/FormLayout";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof formSchema>;

export default function SignUpPage() {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(formSchema)
    });

    const onSubmit = async (data: FormData) => {
        // Here you would typically send the data to your API to create the user
        console.log("Form submitted:", data);

        try {
            const { error } = await authClient.signUp.email({
                name: data.name,
                email: data.email,
                password: data.password
            });

            if (error) {
                toast.error(error.message || "Failed to sign up");
                return;
            }
            toast.success("Account created successfully! Please check your email to verify your account.");
            router.push("/");
            
        } catch (error) {
            toast.error("Unexpected error occurred");
            console.error("Unexpected error:", error);
        }
    }

    return (
        <FormLayout title="Sign Up" description="Create a new account">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <Label>Name</Label>
                    <Input className="w-full px-3 py-2 border rounded" {...register("name")} />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
                <div className="mb-4">
                    <Label>Email</Label>
                    <Input className="w-full px-3 py-2 border rounded" {...register("email")} />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>
                <div className="mb-4">
                    <Label>Password</Label>
                    <Input type="password" className="w-full px-3 py-2 border rounded" {...register("password")} />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
        </FormLayout>
    );

}