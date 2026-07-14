import { SubjectSidebar } from "./components/SubjectSidebar";

export default function MateriasLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full">
            <SubjectSidebar />
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
