// ===== 模板：螺旋传动（Lead Screw） =====
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeScrew, makeNut, makeBase } from '../engine/GeometryFactory';
import { animClock } from '../engine/AnimationDriver';
import type { Concept } from '../types';

function LeadScrew({ params }: { params: Record<string, number>; time: number }) {
  const { group, screw, nut, base } = useMemo(() => {
    const len = 3.0;
    const screw = makeScrew({ length: len, radius: 0.34, lead: 0.8, color: 0x4dd0ff });
    const nut = makeNut(0.34, 0xff8a4d);
    const base = makeBase([1.0, 0.12, 2.0]);
    base.position.z = 0;
    const standL = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x2a3a5c, metalness: 0.3, roughness: 0.6 }),
    );
    standL.position.set(-1.45, -0.25, 0);
    const standR = standL.clone();
    standR.position.x = 1.45;

    const group = new THREE.Group();
    group.add(base, screw, nut, standL, standR);
    return { group, screw, nut, base };
  }, []);

  useFrame(() => {
    const speed = params.speed ?? 50;
    const lead = params.lead ?? 0.8;
    const len = 3.0;
    const theta = (speed * animClock.current * Math.PI) / 180;
    screw.rotation.y = theta;
    // 螺母沿 Y 往复（丝杠机床式往返）
    const travel = len / 2 - 0.6;
    const nutY = Math.sin(theta) * travel;
    nut.position.y = nutY;
  });

  return <primitive object={group} />;
}

export const leadScrewConcept: Concept = {
  id: 'lead-screw',
  title: '螺旋传动',
  principle: '螺杆的旋转运动通过螺纹转换为螺母的直线运动，导程决定转一圈前进的距离。',
  description:
    '螺杆（蓝）旋转，螺母（橙）沿螺杆直线移动。导程越大，螺母每圈走得越远——这是机床、3D 打印机、升降平台的核心传动。',
  params: [
    { key: 'lead', label: '导程', min: 0.4, max: 1.4, step: 0.1, default: 0.8, unit: '×0.1' },
    { key: 'speed', label: '转速', min: 10, max: 120, step: 5, default: 50, unit: '°/s' },
  ],
  teaching: [
    { title: '导程的含义', body: '导程 = 螺杆转一圈，螺母前进的距离。导程大 → 速度快但省力小；导程小 → 慢而省力（机械利益）。' },
    { title: '自锁特性', body: '小导程螺旋（小螺旋升角）具有自锁性：螺母不能倒推螺杆旋转——所以千斤顶能停在任意高度。' },
    { title: '观察引导', body: '调大导程，看螺母每圈跑得更远；调小则变慢但"更稳"。对比丝杠与普通螺栓的传动区别。' },
  ],
  render: LeadScrew,
};
