interface FormLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
};
export default function FormLayout({ title, description, children }: FormLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">{title}</h1>
                <p className="text-gray-600 mb-6">{description}</p>
                {children}
            </div>
        </div>
    );
};