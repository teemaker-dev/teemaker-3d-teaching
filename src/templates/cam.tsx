// ===== 模板：凸轮机构（Cam & Follower） =====
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeCam, makeBlock, makeBase, makePin } from '../engine/GeometryFactory';
import { animClock } from '../engine/AnimationDriver';
import type { Concept } from '../types';

/** 与 GeometryFactory.makeCam 一致的升程函数（0-120推程/120-150远休/150-270回程/270-360近休） */
function camLift(angDeg: number, baseR: number, lift: number): number {
  const deg = ((angDeg % 360) + 360) % 360;
  if (deg < 120) {
    const t = deg / 120;
    return lift * 0.5 * (1 - Math.cos(Math.PI * t));
  }
  if (deg < 150) return lift;
  if (deg < 270) {
    const t = (deg - 150) / 120;
    return lift * 0.5 * (1 + Math.cos(Math.PI * t));
  }
  return 0;
}

function CamFollower({ params }: { params: Record<string, number>; time: number }) {
  const { group, cam, follower, pin } = useMemo(() => {
    const baseR = 1.0;
    const lift = 0.6;
    const cam = makeCam({ baseR, lift, thickness: 0.3, color: 0x4dd0ff });
    cam.position.y = 0;

    // 从动件（滚子从动件：杆 + 滚子）
    const followerGroup = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 1.6, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.5, roughness: 0.45 }),
    );
    stem.position.y = 1.1;
    followerGroup.add(stem);
    const roller = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.16, 20),
      new THREE.MeshStandardMaterial({ color: 0xdde5f0, metalness: 0.8, roughness: 0.3 }),
    );
    roller.rotation.x = Math.PI / 2;
    roller.position.y = 0.3;
    followerGroup.add(roller);
    followerGroup.position.y = 0.35; // 滚子底部贴近凸轮顶

    const guide = makeBlock(0.34, 0x2a3a5c);
    guide.position.y = 1.9;
    const base = makeBase([2.4, 0.12, 1.4]);
    base.position.y = -0.5;
    const post = makeBlock(0.22, 0x2a3a5c);
    post.scale.set(1, 5, 1);
    post.position.set(0, 1.9, -0.75);

    const pin = makePin(0.05, 0.2);
    pin.position.z = 0;

    const group = new THREE.Group();
    group.add(base, cam, followerGroup, guide, post, pin);
    return { group, cam, follower: followerGroup, pin };
  }, []);

  useFrame(() => {
    const speed = params.speed ?? 60;
    const baseR = 1.0;
    const lift = 0.6;
    const thetaDeg = (speed * animClock.current) % 360;
    cam.rotation.z = (thetaDeg * Math.PI) / 180;
    // 从动件在 +Y 方向接触，接触角 = theta + 90°
    const liftNow = camLift(thetaDeg + 90, baseR, lift);
    follower.position.y = 0.35 + liftNow;
  });

  return <primitive object={group} />;
}

export const camConcept: Concept = {
  id: 'cam',
  title: '凸轮机构',
  principle: '凸轮旋转轮廓推动从动件产生特定的往复运动规律。',
  description:
    '凸轮（蓝）旋转，其轮廓（基圆 + 升程段）推动从动件（黄）上下移动。通过改变轮廓，可获得任意要求的运动规律。',
  params: [
    { key: 'speed', label: '凸轮转速', min: 10, max: 120, step: 5, default: 60, unit: '°/s' },
  ],
  teaching: [
    { title: '运动规律', body: '推程段从动件按简谐运动上升，远休段保持最高位，回程段下降，近休段静止——一个周期四个阶段。' },
    { title: '为什么凸轮重要', body: '它能实现任意指定运动规律，是内燃机配气、自动机床、机械手的心脏。轮廓形状 = 运动函数。' },
    { title: '观察引导', body: '盯着滚子：凸轮推程时滚子上行，远休时停住，回程下降。轮廓越"陡"，从动件运动越快。' },
  ],
  render: CamFollower,
};
