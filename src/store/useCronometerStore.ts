import { create } from 'zustand';

interface Cronometer {
    isRunning: boolean;
    seconds: number;
    // Datas UTC para evitar problemas de timezone com @db.Date do Prisma
    startTime: Date | null;
    endTime: Date | null;
}

interface CronometerState {
    cronometer: Cronometer;
    setCronometer: (cronometer: Cronometer) => void;
    updateCronometer: (partial: Partial<Cronometer>) => void;
    startTicking: () => void;
    stopTicking: () => void;
    resetCronometer: () => void;
    clearCronometer: () => void;
}

let tickIntervalId: ReturnType<typeof setInterval> | null = null;

const useCronometerStore = create<CronometerState>((set, get) => ({
    cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null },

    setCronometer: (cronometer) => set({ cronometer }),
    updateCronometer: (partial) => set((state) => ({
        cronometer: { ...state.cronometer, ...partial }
    })),
    startTicking: () => {
        if (tickIntervalId) return;

        const tick = () => {
            const { cronometer } = get();
            if (!cronometer.startTime) return;
            const elapsed = Math.floor(
                (Date.now() - new Date(cronometer.startTime).getTime()) / 1000
            );
            set((state) => ({
                cronometer: { ...state.cronometer, seconds: elapsed }
            }));
        };

        tick();
        tickIntervalId = setInterval(tick, 1000);
    },
    stopTicking: () => {
        if (tickIntervalId) {
            clearInterval(tickIntervalId);
            tickIntervalId = null;
        }
    },
    resetCronometer: () => {
        if (tickIntervalId) {
            clearInterval(tickIntervalId);
            tickIntervalId = null;
        }
        set({
            cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null }
        });
    },
    clearCronometer: () => {
        if (tickIntervalId) {
            clearInterval(tickIntervalId);
            tickIntervalId = null;
        }
        set({
            cronometer: { isRunning: false, seconds: 0, startTime: null, endTime: null }
        });
    }
}));

export default useCronometerStore;
