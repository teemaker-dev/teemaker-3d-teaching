// ===== 模板：行星齿轮（Planetary Gear） =====
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeGear, makeBase, makePin } from '../engine/GeometryFactory';
import { animClock } from '../engine/AnimationDriver';
import type { Concept } from '../types';

const MODULE = 0.18;

function Planetary({ params }: { params: Record<string, number>; time: number }) {
  const { group, sun, planets, carrier, ring } = useMemo(() => {
    const zSun = Math.max(8, Math.round(params.zSun));
    const zPlanet = Math.max(8, Math.round(params.zPlanet));
    const zRing = zSun + 2 * zPlanet;
    const centerDist = (MODULE * (zSun + zPlanet)) / 2; // 太阳-行星中心距

    const sun = makeGear({ teeth: zSun, module: MODULE, thickness: 0.26, color: 0x4dd0ff });
    const planets = Array.from({ length: 3 }, (_, i) => {
      const p = makeGear({ teeth: zPlanet, module: MODULE, thickness: 0.26, color: 0xffd166 });
      const ang = (i / 3) * Math.PI * 2;
      p.position.set(Math.cos(ang) * centerDist, Math.sin(ang) * centerDist, 0);
      return { mesh: p, ang, offset: ang };
    });

    // 齿圈（内齿：圆环 + 内侧齿形简化）
    const ringR = centerDist + (MODULE * zPlanet) / 2;
    const ringShape = new THREE.Shape();
    const N = Math.round(zRing * 1.6);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = ringR + MODULE * 0.7;
      if (i === 0) ringShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ringShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    // 内孔
    const hole = new THREE.Path();
    const HN = Math.round(zRing * 2);
    for (let i = 0; i <= HN; i++) {
      const a = (i / HN) * Math.PI * 2;
      const r = ringR - MODULE * 0.5;
      if (i === 0) hole.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else hole.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ringShape.holes.push(hole);
    const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
      depth: 0.28,
      bevelEnabled: false,
      curveSegments: 2,
    });
    ringGeo.translate(0, 0, -0.14);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({ color: 0x9aa7bd, metalness: 0.7, roughness: 0.38 }),
    );

    // 行星架（圆盘 + 3 轴）
    const carrier = new THREE.Group();
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(centerDist * 1.25, centerDist * 1.25, 0.1, 32),
      new THREE.MeshStandardMaterial({ color: 0x2a3a5c, metalness: 0.4, roughness: 0.55 }),
    );
    disc.rotation.x = Math.PI / 2;
    carrier.add(disc);
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2;
      const ax = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x5a6a8c, metalness: 0.6, roughness: 0.4 }),
      );
      ax.position.set(Math.cos(ang) * centerDist, Math.sin(ang) * centerDist, 0);
      carrier.add(ax);
    }

    const base = makeBase([centerDist * 3, 0.1, centerDist * 3]);
    base.position.y = -0.42;

    const pin = makePin(0.06, 0.3);

    const group = new THREE.Group();
    group.add(base, ring, carrier, sun, ...planets.map((p) => p.mesh), pin);
    return { group, sun, planets, carrier, ring };
  }, [params]);

  useFrame(() => {
    const speed = params.speed ?? 40;
    const zSun = Math.max(8, Math.round(params.zSun));
    const zPlanet = Math.max(8, Math.round(params.zPlanet));
    const zRing = zSun + 2 * zPlanet;
    const theta = (speed * animClock.current * Math.PI) / 180;

    // 太阳轮固定，行星架旋转（输入），行星轮自转（齿圈固定）
    carrier.rotation.z = theta;
    for (const { mesh, ang } of planets) {
      const abs = ang + theta; // 行星轮中心位置角
      const centerDist = (MODULE * (zSun + zPlanet)) / 2;
      mesh.position.set(Math.cos(abs) * centerDist, Math.sin(abs) * centerDist, 0);
      // 行星轮自转（齿圈静止时）：ω_p = -ω_c * (1 + zSun/zPlanet)
      mesh.rotation.z = -theta * (1 + zSun / zPlanet);
    }
  });

  return <primitive object={group} />;
}

export const planetaryConcept: Concept = {
  id: 'planetary',
  title: '行星齿轮',
  principle: '太阳轮居中、行星轮绕其公转并自转、齿圈固定——一个输入可得到大减速比。',
  description:
    '行星架（输入）旋转，带动行星轮（黄）绕太阳轮（蓝）公转，同时在固定齿圈内自转。单级即可实现大减速比。',
  params: [
    { key: 'zSun', label: '太阳轮齿数', min: 8, max: 16, step: 1, default: 10 },
    { key: 'zPlanet', label: '行星轮齿数', min: 8, max: 16, step: 1, default: 12 },
    { key: 'speed', label: '行星架转速', min: 10, max: 120, step: 5, default: 40, unit: '°/s' },
  ],
  teaching: [
    { title: '大减速比', body: '齿圈固定时：i = 1 + z齿圈/z太阳 = 1 + (zSun+2zPlanet)/zSun。例：10+2×12=34 齿圈，i = 4.4——单级就减速 4 倍多。' },
    { title: '为什么叫行星', body: '行星轮既绕太阳轮"公转"，又绕自身"自转"，就像行星绕恒星——这是自动变速箱、风电齿轮箱的核心。' },
    { title: '观察引导', body: '改齿数看传动比变化（右栏公式实时更新）。行星架转一圈，行星轮要自转多圈——数一数它的齿。' },
  ],
  render: Planetary,
};
