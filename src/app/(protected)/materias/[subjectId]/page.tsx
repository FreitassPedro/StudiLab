
import { SubjectHeader } from "./components/SubjectHeader";

import { Suspense } from "react";
import { SubjectSidebar } from "../components/SubjectSidebar";
import { SubjectTabs } from "./components/TabsContent";


interface Props {
    params: Promise<{ subjectId: string }>;
}

export default async function SubjectPanelPage({ params }: Props) {
    const { subjectId } = await params;

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full">
            <SubjectSidebar currentSubjectId={subjectId} />

            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
                    <Suspense fallback={<div>Carregando...</div>}>
                        <SubjectHeader subjectId={subjectId} />
                        <SubjectTabs subjectId={subjectId} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

