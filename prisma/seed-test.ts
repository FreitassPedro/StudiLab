import { prisma } from "@/lib/prisma";

type SubjectMock = {
    name: string;
    isOpen: boolean;
    isArchived: boolean;
    color: string;
};

type TopicMock = {
    key: string;
    name: string;
    subjectName: string;
    parentKey?: string;
};

type StudyLogMock = {
    topicKey: string;
    start: string;
    end: string;
    notes?: string;
};

const SUBJECT_MOCKS: SubjectMock[] = [
    { name: "Matemática", color: "#EF4444", isOpen: true, isArchived: false },
    { name: "Física", color: "#10B981", isOpen: true, isArchived: false },
    { name: "Computação", color: "#3B82F6", isOpen: true, isArchived: false },
];

const TOPIC_MOCKS: TopicMock[] = [
    { key: "mat-algebra", name: "Álgebra", subjectName: "Matemática" },
    { key: "mat-eq", name: "Equações", subjectName: "Matemática", parentKey: "mat-algebra" },
    { key: "mat-eq-1", name: "1º Grau", subjectName: "Matemática", parentKey: "mat-eq" },
    { key: "mat-eq-2", name: "2º Grau", subjectName: "Matemática", parentKey: "mat-eq" },
    { key: "mat-geo", name: "Geometria", subjectName: "Matemática" },
    { key: "mat-geo-ana", name: "Geometria Analítica", subjectName: "Matemática", parentKey: "mat-geo" },

    { key: "fis-mec", name: "Mecânica", subjectName: "Física" },
    { key: "fis-newton", name: "Leis de Newton", subjectName: "Física", parentKey: "fis-mec" },
    { key: "fis-newton-apl", name: "Aplicações", subjectName: "Física", parentKey: "fis-newton" },
    { key: "fis-term", name: "Termodinâmica", subjectName: "Física" },
    { key: "fis-term-1", name: "1ª Lei", subjectName: "Física", parentKey: "fis-term" },

    { key: "comp-web", name: "Web", subjectName: "Computação" },
    { key: "comp-web-api", name: "APIs", subjectName: "Computação", parentKey: "comp-web" },
    { key: "comp-web-rest", name: "REST", subjectName: "Computação", parentKey: "comp-web-api" },
    { key: "comp-web-auth", name: "Autenticação", subjectName: "Computação", parentKey: "comp-web-api" },
];

const STUDY_LOG_MOCKS: StudyLogMock[] = [
    {
        topicKey: "mat-eq-1",
        start: "2026-03-10T08:00:00.000Z",
        end: "2026-03-10T09:00:00.000Z",
        notes: "Resolução de listas de equações de 1º grau",
    },
    {
        topicKey: "mat-geo-ana",
        start: "2026-03-10T14:00:00.000Z",
        end: "2026-03-10T14:45:00.000Z",
        notes: "Distância entre pontos e equação da reta",
    },
    {
        topicKey: "fis-newton-apl",
        start: "2026-03-11T10:30:00.000Z",
        end: "2026-03-11T11:20:00.000Z",
        notes: "Exercícios de força resultante",
    },
    {
        topicKey: "comp-web-rest",
        start: "2026-03-11T16:00:00.000Z",
        end: "2026-03-11T17:30:00.000Z",
        notes: "Padrões REST e versionamento de endpoints",
    },
    {
        topicKey: "comp-web-auth",
        start: "2026-03-12T09:15:00.000Z",
        end: "2026-03-12T10:00:00.000Z",
        notes: "Fluxos de autenticação com JWT",
    },
];

async function main() {
    await prisma.studyLogs.deleteMany(); // Limpa os dados existentes para evitar duplicatas
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'teste@teste.com'
        },
    });

    const subjectsByName = new Map<string, { id: string }>();
    for (const subject of SUBJECT_MOCKS) {
        const createdSubject = await prisma.subject.create({
            data: {
                name: subject.name,
                color: subject.color,
                userId: user.id,
                isOpen: subject.isOpen,
                isArchived: subject.isArchived,
            },
        });
        subjectsByName.set(subject.name, { id: createdSubject.id });
    }

    const topicsByKey = new Map<string, { id: string }>();
    const pendingTopics = [...TOPIC_MOCKS];

    while (pendingTopics.length > 0) {
        let createdInPass = 0;

        for (let index = 0; index < pendingTopics.length; index++) {
            const topic = pendingTopics[index];
            const subject = subjectsByName.get(topic.subjectName);

            if (!subject) {
                throw new Error(`Subject '${topic.subjectName}' não encontrado para o tópico '${topic.name}'.`);
            }

            if (topic.parentKey && !topicsByKey.has(topic.parentKey)) {
                continue;
            }

            const createdTopic = await prisma.topic.create({
                data: {
                    name: topic.name,
                    subjectId: subject.id,
                    parentId: topic.parentKey ? topicsByKey.get(topic.parentKey)?.id : null,
                },
            });

            topicsByKey.set(topic.key, { id: createdTopic.id });
            pendingTopics.splice(index, 1);
            index--;
            createdInPass++;
        }

        if (createdInPass === 0) {
            throw new Error("Não foi possível resolver a hierarquia dos tópicos de mock.");
        }
    }

    for (const studyLog of STUDY_LOG_MOCKS) {
        const topic = topicsByKey.get(studyLog.topicKey);
        if (!topic) {
            throw new Error(`Topic '${studyLog.topicKey}' não encontrado para o StudyLog.`);
        }

        const startTime = new Date(studyLog.start);
        const endTime = new Date(studyLog.end);
        const durationMinutes = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 60000));

        await prisma.studyLogs.create({
            data: {
                topicId: topic.id,
                study_date: startTime,
                start_time: startTime,
                end_time: endTime,
                duration_minutes: durationMinutes,
                notes: studyLog.notes,
            },
        });
    }

    console.log('✅ Test database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });