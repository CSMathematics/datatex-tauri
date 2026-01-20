import { create } from "zustand";

interface CursorState {
  lineNumber: number;
  column: number;
  setCursor: (line: number, column: number) => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  lineNumber: 1,
  column: 1,
  setCursor: (lineNumber, column) => {
    set((state) => {
      if (state.lineNumber === lineNumber && state.column === column) {
        return state; // No change, no re-render
      }
      return { lineNumber, column };
    });
  },
}));
