import { auth } from "@/lib/auth";
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
    { name: "Português", color: "#3B82F6", isOpen: true, isArchived: false },
    { name: "História", color: "#F59E0B", isOpen: true, isArchived: false },
];

const TOPIC_MOCKS: TopicMock[] = [
    // Matemática
    { key: "mat-algebra", name: "Álgebra", subjectName: "Matemática" },
    { key: "mat-eq", name: "Equações", subjectName: "Matemática", parentKey: "mat-algebra" },
    { key: "mat-eq-1", name: "1º Grau", subjectName: "Matemática", parentKey: "mat-eq" },
    { key: "mat-eq-2", name: "2º Grau", subjectName: "Matemática", parentKey: "mat-eq" },
    { key: "mat-geo", name: "Geometria", subjectName: "Matemática" },
    { key: "mat-geo-ana", name: "Geometria Analítica", subjectName: "Matemática", parentKey: "mat-geo" },

    // Física
    { key: "fis-mec", name: "Mecânica", subjectName: "Física" },
    { key: "fis-newton", name: "Leis de Newton", subjectName: "Física", parentKey: "fis-mec" },
    { key: "fis-newton-1", name: "1ª Lei", subjectName: "Física", parentKey: "fis-newton" },
    { key: "fis-newton-2", name: "2ª Lei", subjectName: "Física", parentKey: "fis-newton" },
    { key: "fis-term", name: "Termodinâmica", subjectName: "Física" },

    // Português
    { key: "port-gram", name: "Gramática", subjectName: "Português" },
    { key: "port-verb", name: "Verbos", subjectName: "Português", parentKey: "port-gram" },
    { key: "port-interp", name: "Interpretação", subjectName: "Português" },

    // História
    { key: "hist-brasil", name: "Brasil", subjectName: "História" },
    { key: "hist-colonia", name: "Colônia", subjectName: "História", parentKey: "hist-brasil" },
    { key: "hist-geral", name: "Geral", subjectName: "História" },
];

const STUDY_LOG_MOCKS: StudyLogMock[] = [
    {
        topicKey: "mat-eq-1",
        start: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
        notes: "Revisão de equações lineares simples",
    },
    {
        topicKey: "fis-newton-2",
        start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
        notes: "F=ma e exercícios de força",
    },
    {
        topicKey: "port-verb",
        start: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        notes: "Tempos verbais: pretérito perfeito",
    },
    {
        topicKey: "hist-colonia",
        start: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        notes: "Ciclo do açúcar e economia colonial",
    },
    {
        topicKey: "mat-geo-ana",
        start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        notes: "Equação da reta e coeficiente angular",
    },
];

async function main() {
    const dbUrl = process.env.DATABASE_URL || "";
    if (!dbUrl.includes("localhost") && !dbUrl.includes("test") && !dbUrl.includes("5433")) {
        console.error("❌ CRITICAL: Attempting to run seed-test on a non-local/non-test database!");
        console.error("DATABASE_URL:", dbUrl);
        process.exit(1);
    }

    console.log('🧹 Cleaning database...');
    await prisma.studyLogs.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verification.deleteMany();

    console.log('👤 Creating test user...');
    const { user } = await auth.api.signUpEmail({
        body: {
            email: "test-user@example.com",
            password: "test-password",
            name: "Test User",
        }
    });

    if (!user) {
        throw new Error("Failed to create test user");
    }

    const subjectsByName = new Map<string, { id: string }>();
    console.log('📚 Creating subjects...');
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

    console.log('🌿 Creating topics...');
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

    console.log('📝 Creating study logs...');
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
