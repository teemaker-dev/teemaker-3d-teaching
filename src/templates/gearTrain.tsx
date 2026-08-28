// ===== 模板：齿轮传动（Gear Train） =====
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeGear, makeBase, makePin } from '../engine/GeometryFactory';
import { animClock } from '../engine/AnimationDriver';
import type { Concept } from '../types';

const MODULE = 0.26;

function GearTrain({ params }: { params: Record<string, number>; time: number }) {
  const { group, gear1, gear2 } = useMemo(() => {
    const z1 = Math.max(8, Math.round(params.z1));
    const z2 = Math.max(8, Math.round(params.z2));
    const g1 = makeGear({ teeth: z1, module: MODULE, thickness: 0.3, color: 0x4dd0ff });
    const g2 = makeGear({ teeth: z2, module: MODULE, thickness: 0.3, color: 0xff8a4d });
    const dist = (MODULE * (z1 + z2)) / 2;
    g2.position.x = dist;
    const base = makeBase([dist * 2.4, 0.12, 1.5]);
    base.position.y = -0.38;
    const pin1 = makePin(0.07, 0.36);
    pin1.position.z = 0;
    const group = new THREE.Group();
    group.add(base, g1, g2, pin1);
    return { group, gear1: g1, gear2: g2 };
  }, [params]);

  useFrame(() => {
    const speed = params.speed ?? 40;
    const z1 = Math.max(8, Math.round(params.z1));
    const z2 = Math.max(8, Math.round(params.z2));
    const theta = (speed * animClock.current * Math.PI) / 180;
    gear1.rotation.z = theta;
    gear2.rotation.z = -theta * (z1 / z2); // 外啮合反向，传动比 z1/z2
  });

  return <primitive object={group} />;
}

export const gearTrainConcept: Concept = {
  id: 'gear-train',
  title: '齿轮传动',
  principle: '一对齿轮啮合传动，转速比等于齿数反比，且转向相反。',
  description:
    '主动轮（蓝）驱动从动轮（橙）旋转。观察：齿数越多的齿轮转得越慢；两轮转向相反；传动比 i = z₁/z₂。',
  params: [
    { key: 'z1', label: '主动轮齿数', min: 8, max: 28, step: 1, default: 12 },
    { key: 'z2', label: '从动轮齿数', min: 8, max: 28, step: 1, default: 20 },
    { key: 'speed', label: '转速', min: 10, max: 120, step: 5, default: 40, unit: '°/s' },
  ],
  teaching: [
    { title: '传动比', body: 'i = z₁/z₂ = ω₂/ω₁。本例 12:20 = 0.6，从动轮转速为主动轮的 60%，方向相反。' },
    { title: '为什么齿数多转得慢', body: '齿距相同（模数相同）时，齿数多 → 分度圆大 → 线速度相同但角速度小。' },
    { title: '观察引导', body: '调大 z₂，看橙色轮明显变慢；调小 z₂ 则变快。两轮永远保持啮合（中心距=两分度圆半径之和）。' },
  ],
  render: GearTrain,
};
