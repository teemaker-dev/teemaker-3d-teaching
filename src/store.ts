import { create } from 'zustand';
import type { AppState } from './types';
import { getConcept } from './data/concepts';

/** 由概念参数规格生成默认值字典（根治：params 永不缺 key） */
function defaultParams(id: string): Record<string, number> {
  const c = getConcept(id);
  const p: Record<string, number> = {};
  for (const spec of c.params) p[spec.key] = spec.default;
  return p;
}

export const useStore = create<AppState>((set) => ({
  conceptId: 'gear-train',
  params: defaultParams('gear-train'),
  running: true,
  autoRotate: true,
  setConcept: (id) => set({ conceptId: id, params: defaultParams(id) }),
  setParam: (key, value) =>
    set((s) => ({ params: { ...s.params, [key]: value } })),
  toggleRunning: () => set((s) => ({ running: !s.running })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
}));
