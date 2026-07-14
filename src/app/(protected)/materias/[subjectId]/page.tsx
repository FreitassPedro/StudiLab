import { SubjectHeader } from "./components/SubjectHeader";

import { Suspense } from "react";
import { SubjectTabs } from "./components/TabsContent";


interface Props {
    params: Promise<{ subjectId: string }>;
}

export default async function SubjectPanelPage({ params }: Props) {
    const { subjectId } = await params;

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 animate-in fade-in duration-500">
            <Suspense fallback={<div>Carregando...</div>}>
                <SubjectHeader subjectId={subjectId} />
                <SubjectTabs subjectId={subjectId} />
            </Suspense>
        </div>
    );
}
