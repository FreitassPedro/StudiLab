import SubjectList from "./SubjectList";
import { NewSubject } from "./components/NewSubject";

export default function MateriasPage() {

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Matérias</h1>
            </div>
            <NewSubject />
            <SubjectList />
        </div>
    );
}
