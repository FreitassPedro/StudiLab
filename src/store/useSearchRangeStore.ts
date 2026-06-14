import { create } from 'zustand';

export interface DateRange {
    startDate: Date;
    endDate: Date;
    rangeType?: 'day' | 'week' | 'month' | 'custom';
}

interface SearchRangeState {
    startDate: Date;
    endDate: Date;
    rangeType?: 'day' | 'week' | 'month' | 'custom';
    setRange: (range: DateRange) => void;
    setRangeType: (type: 'day' | 'week' | 'month' | 'custom') => void;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
}

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const useSearchRangeStore = create<SearchRangeState>((set) => ({
    startDate: getToday(),
    endDate: getToday(),
    setRange: (range) => set({ startDate: range.startDate, endDate: range.endDate, rangeType: range.rangeType }),
    setRangeType: (type) => set({ rangeType: type }),
    setStartDate: (date) => set({ startDate: date }),
    setEndDate: (date) => set({ endDate: date }),
}));

export default useSearchRangeStore;

