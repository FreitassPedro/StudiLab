import FormLayout from "@/components/layout/FormLayout";
import { Label } from "@/components/ui/label";

import { z } from "zod";
const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})
export default function SignUpPage() {
    const {} = useForm
    return (
        <FormLayout title="Sign Up" description="Create a new account">

            <form>
                <div className="mb-4">
                    <Label>Email</Label>
                    <input type="email" id="email" className="w-full px-3 py-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <Label>Password</Label>
                    <input type="password" id="password" className="w-full px-3 py-2 border rounded" required />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Sign Up</button>
            </form>
        </FormLayout>
    );

}