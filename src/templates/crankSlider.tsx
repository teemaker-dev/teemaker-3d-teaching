// ===== 模板：曲柄连杆机构（Crank-Slider） =====
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeRod, makeBlock, makePin, makeBase } from '../engine/GeometryFactory';
import { animClock } from '../engine/AnimationDriver';
import type { Concept } from '../types';

function CrankSlider({ params }: { params: Record<string, number>; time: number }) {
  const { group, crank, rod, slider, pinA } = useMemo(() => {
    const crank = new THREE.Group();
    const crankArm = makeRod(0.9, 0.14, 0.12, 0x4dd0ff);
    crankArm.position.x = 0.45; // 曲柄沿 +X 伸展
    crank.add(crankArm);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.16, 20),
      new THREE.MeshStandardMaterial({ color: 0x4dd0ff, metalness: 0.7, roughness: 0.4 }),
    );
    hub.rotation.x = Math.PI / 2;
    crank.add(hub);

    const rod = makeRod(1.6, 0.12, 0.1, 0xffd166);
    rod.position.set(1.7, 0, 0);

    const slider = makeBlock(0.5, 0x8fd18f, true);
    slider.position.set(2.5, 0, 0);

    const base = makeBase([3.6, 0.12, 0.9]);
    base.position.y = -0.42;
    base.position.x = 1.0;

    const pinA = makePin(0.06, 0.2, 0xdde5f0);

    const group = new THREE.Group();
    group.add(base, crank, rod, slider, pinA);
    return { group, crank, rod, slider, pinA };
  }, []);

  useFrame(() => {
    const r = (params.crankR ?? 0.9) / 10; // 缩放语义：0.05~0.15
    const l = params.rodLen ?? 1.6;
    const speed = params.speed ?? 60;
    const theta = (speed * animClock.current * Math.PI) / 180;

    const crankLen = r * 10;
    // 曲柄末端（销位置）
    const cx = Math.cos(theta) * crankLen;
    const cy = Math.sin(theta) * crankLen;
    // 曲柄臂方向
    crank.rotation.z = theta;
    // 滑块 x（沿 +X 水平）
    const d = l;
    const s = Math.sqrt(d * d - cy * cy);
    const sx = cx + s;
    // 滑块位置
    slider.position.x = sx - 0.7; // 视觉偏移对齐
    // 连杆连接曲柄销 -> 滑块，方向与长度
    const dx = sx - cx;
    const dy = 0 - cy;
    const rodLen = Math.hypot(dx, dy);
    rod.position.set((cx + sx) / 2 - 0.7, cy / 2, 0);
    rod.rotation.z = Math.atan2(dy, dx);
    rod.scale.set(1, 1, 1);
    // 销在曲柄末端
    pinA.position.set(cx, cy, 0);
  });

  return <primitive object={group} />;
}

export const crankSliderConcept: Concept = {
  id: 'crank-slider',
  title: '曲柄连杆机构',
  principle: '曲柄的圆周运动通过连杆转换为滑块的往复直线运动。',
  description:
    '曲柄（蓝）绕中心旋转，经连杆（黄）驱动滑块（绿）沿直线往复运动。观察滑块速度的变化规律。',
  params: [
    { key: 'crankR', label: '曲柄半径', min: 5, max: 14, step: 1, default: 9, unit: '×0.1' },
    { key: 'rodLen', label: '连杆长度', min: 10, max: 22, step: 1, default: 16, unit: '×0.1' },
    { key: 'speed', label: '转速', min: 10, max: 120, step: 5, default: 60, unit: '°/s' },
  ],
  teaching: [
    { title: '运动转换', body: '圆周运动 → 往复直线运动。这是内燃机活塞、蒸汽机的核心机构。' },
    { title: '滑块速度变化', body: '滑块在两端（死点）速度为零、中间最快——不是匀速直线运动。曲柄越长、连杆越短，速度波动越大。' },
    { title: '观察引导', body: '增大曲柄半径，看滑块行程变长；缩短连杆，看滑块运动更"急促"。' },
  ],
  render: CrankSlider,
};
