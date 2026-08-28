// ===== 概念/模板 类型定义 =====

/** 参数规格：滑块如何呈现 */
export interface ParamSpec {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}

/** 教学要点卡 */
export interface TeachingItem {
  title: string;
  body: string;
}

/** 概念 = 一个教具模板 + 元数据 + 参数 + 教学 */
export interface Concept {
  id: string;
  title: string;
  principle: string; // 一句话原理
  description: string; // 演示说明
  params: ParamSpec[];
  teaching: TeachingItem[];
  /** R3F 组件：渲染 3D 机构（geometry + 动画） */
  render: React.ComponentType<{ params: Record<string, number>; time: number }>;
}

/** zustand 状态 */
export interface AppState {
  conceptId: string;
  params: Record<string, number>;
  running: boolean;
  autoRotate: boolean;
  setConcept: (id: string) => void;
  setParam: (key: string, value: number) => void;
  toggleRunning: () => void;
  toggleAutoRotate: () => void;
}
