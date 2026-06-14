interface TopicDB {
  id: string;
  name: string;
}

// --- Mock de Dados para Testes ---
// Programação/
//  Web/
//   REST/
//   API/
//  Java/
//   SPRING/
const topicMock: TopicDB[] = [
  { id: "1", name: "programação" },
  { id: "3", name: "REST" },
  { id: "4", name: "API" },
  { id: "2", name: "Web" },
  { id: "5", name: "Java" },
  { id: "6", name: "Spring" }
];

export interface TopicNode {
  id: string;
  name: string;
  children: TopicNode[];
};


export const mockJsonTopicTree: { id: string; name: string; color: string, topics: TopicNode[] }[] = [
  {
    "id": "1",
    "name": "Computação",
    "color": "#4F46E5",    
    "topics": [
      {
        "id": "1",
        "name": "Programação",
        "children": [
          {
            "id": "2",
            "name": "Web",
            "children": [
              { "id": "3", "name": "REST", "children": [] },
              { "id": "4", "name": "API", "children": [] }
            ]
          },
          { "id": "5", "name": "Java", "children": [] }
        ]
      },
    ]
  },
  {
    "id": "2",
    "name": "Biologia",
    "color": "#16A34A",
    "topics": [
      {
        "id": "6",
        "name": "Citologia",
        "children": [
          { "id": "7", "name": "Célula Animal", "children": [] },
          { "id": "9", "name": "Célula Vegetal", "children": [] },
          {
            "id": "10", "name": "Divisão Celular", "children": [
              { "id": "11", "name": "Mitose", "children": [] },
              { "id": "12", "name": "Meiose", "children": [] }
            ]
          }
        ]
      },
      {
        "id": "7",
        "name": "Genética",
        "children": [
          { "id": "13", "name": "Mendelismo", "children": [] },
        ]
      }
    ]
  },
  {
    "id": "3",
    "name": "Física",
    "color": "#DC2626",
    "topics": [
      {
        "id": "14",
        "name": "Física",
        "children": [
          {
            "id": "15", "name": "Cinemática", "children": []
          },
          { "id": "16", "name": "Termodinâmica", "children": [] },
          { "id": "17", "name": "Óptica", "children": [] }
        ]
      }
    ]
  }
];

export interface mockStudyLog {
  id: string;
  topicId: string;
  durationMinutes: number;
  date: string; // ISO format
}
export const mockStudyLogs: mockStudyLog[] = [
  { "id": "1", "topicId": "1", "durationMinutes": 45, "date": "2026-03-11" },
  { "id": "2", "topicId": "2", "durationMinutes": 30, "date": "2026-03-10" },
  { "id": "3", "topicId": "2", "durationMinutes": 60, "date": "2026-03-09" },
  { "id": "4", "topicId": "3", "durationMinutes": 20, "date": "2026-03-08" }
];

export const mockJsonDashboardStats = {
  "totalStudyMinutes": 320,
  "topSubjects": [
    { "topicId": "1", "topicName": "Programação", "totalMinutes": 320 },
    { "topicId": "2", "topicName": "Web", "totalMinutes": 200 },
    { "id": "5", "topicName": "Java", "totalMinutes": 120 }
  ],
  "recentLogs": [
    { "id": "101", "topicId": "4", "topicName": "API", "duration": 120, "date": "2026-03-11" },
    { "id": "102", "topicId": "3", "topicName": "REST", "duration": 80, "date": "2026-03-10" },
    { "id": "103", "topicId": "5", "topicName": "Java", "duration": 120, "date": "2026-03-09" }
  ]
};