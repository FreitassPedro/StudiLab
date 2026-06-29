import { create } from 'zustand';


export type RangeType = 'day' | 'week' | 'month' | 'custom';

export interface DateRange {
    startDate: Date;
    endDate: Date;
    rangeType: RangeType;
}

interface SearchRangeState {
    startDate: Date;
    endDate: Date;
    rangeType: RangeType;
    setRange: (range: DateRange) => void;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    setRangeType: (rangeType: RangeType) => void;
}

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const useSearchRangeStore = create<SearchRangeState>((set) => ({
    startDate: getToday(),
    endDate: getToday(),
    rangeType: 'day',
    setRangeType: (rangeType: RangeType) => set({ rangeType }),
    setRange: (range: DateRange) => set({ startDate: range.startDate, endDate: range.endDate, rangeType: range.rangeType }),
    setStartDate: (date: Date) => set({ startDate: date }),
    setEndDate: (date: Date) => set({ endDate: date }),
}));

export default useSearchRangeStore;

