import { z } from 'zod';

export const studySessionSchema = z.object({
  subjectId: z.string().min(1, { message: "Selecione uma matéria." }),
  topicId: z.string().min(1, { message: "Selecione um tópico." }),
  studyMode: z.enum(["teoria", "revisao", "exercicios", "resumo"]),
  study_date: z.date({
    error: issue => issue.input === undefined ? "Required" : "Invalid date"
  }),
  start_time: z.date({
    error: issue => issue.input === undefined ? "Start time is required" : "Invalid time",
  }).optional(),
  end_time: z.date({
    error: issue => issue.input === undefined ? "End time is required" : "Invalid time",
  }).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Se não houver data, os horários não precisam ser validados
    if (!data.start_time || !data.end_time) return true;

    return data.end_time.getTime() > data.start_time.getTime();
  },
  {
    message: "A hora de fim deve ser maior que a hora de início.",
    path: ["end_time"]
  }
);

export type StudySessionFormData = z.infer<typeof studySessionSchema>;
