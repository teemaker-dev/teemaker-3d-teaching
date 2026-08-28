// ===== 程序化几何工厂（零外部素材） =====
// 每个函数返回 three.js Object3D，供模板组件 useMemo 后 <primitive> 渲染
import * as THREE from 'three';

// ---------- 齿轮（梯形齿近似，教学级精度） ----------
export interface GearOptions {
  teeth: number;
  module: number; // 模数：决定齿尺寸
  thickness: number;
  color: number;
}

/** 生成单个齿轮 Mesh（含齿 + 轮辐简化） */
export function makeGear({ teeth, module, thickness, color }: GearOptions): THREE.Group {
  const group = new THREE.Group();
  const pitchR = (module * teeth) / 2;
  const tipR = pitchR + module;
  const rootR = pitchR - 1.25 * module;

  // 齿廓 Shape（梯形齿近似）
  const shape = new THREE.Shape();
  const step = (2 * Math.PI) / teeth; // 齿距角
  const tipHalf = step * 0.2; // 齿顶半宽角
  const rootHalf = step * 0.28; // 齿根半宽角
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    // 齿根起点（前一齿根中点 -> 本齿）
    const r0 = a - rootHalf;
    const r1 = a - tipHalf;
    const r2 = a + tipHalf;
    const r3 = a + rootHalf;
    if (i === 0) {
      shape.moveTo(Math.cos(r0) * rootR, Math.sin(r0) * rootR);
    } else {
      shape.lineTo(Math.cos(r0) * rootR, Math.sin(r0) * rootR);
    }
    shape.lineTo(Math.cos(r1) * tipR, Math.sin(r1) * tipR); // 升齿
    shape.lineTo(Math.cos(r2) * tipR, Math.sin(r2) * tipR); // 齿顶
    shape.lineTo(Math.cos(r3) * rootR, Math.sin(r3) * rootR); // 降齿
  }
  shape.closePath();

  // 齿体挤出
  const gearGeo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 4,
  });
  gearGeo.translate(0, 0, -thickness / 2);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.75,
    roughness: 0.35,
  });
  const gear = new THREE.Mesh(gearGeo, material);
  group.add(gear);

  // 中心轮毂 + 轴孔
  const hubR = Math.min(pitchR * 0.32, 0.5);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(hubR, hubR, thickness * 1.5, 24),
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.4 }),
  );
  hub.rotation.x = Math.PI / 2;
  group.add(hub);

  // 腹板（简化轮辐圆盘）
  if (pitchR > 0.8) {
    const webR = pitchR * 0.62;
    const web = new THREE.Mesh(
      new THREE.CylinderGeometry(webR, webR, thickness * 0.55, 32),
      new THREE.MeshStandardMaterial({ color: 0x9aa7bd, metalness: 0.6, roughness: 0.45 }),
    );
    web.rotation.x = Math.PI / 2;
    group.add(web);
  }
  return group;
}

// ---------- 凸轮（基圆 + 简谐推程/回程） ----------
export interface CamOptions {
  baseR: number;
  lift: number;
  thickness: number;
  color: number;
  segments?: number;
}

/** 生成盘形凸轮（推程 0-120°，远休 120-150°，回程 150-270°，近休 270-360°） */
export function makeCam({ baseR, lift, thickness, color, segments = 128 }: CamOptions): THREE.Group {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  const N = segments;
  shape.moveTo(baseR, 0);
  for (let i = 0; i <= N; i++) {
    const ang = (i / N) * Math.PI * 2;
    let r = baseR;
    const deg = (ang * 180) / Math.PI;
    if (deg < 120) {
      // 推程：简谐运动升程
      const t = deg / 120;
      r = baseR + lift * 0.5 * (1 - Math.cos(Math.PI * t));
    } else if (deg < 150) {
      r = baseR + lift; // 远休
    } else if (deg < 270) {
      // 回程：简谐下降
      const t = (deg - 150) / 120;
      r = baseR + lift * 0.5 * (1 + Math.cos(Math.PI * t));
    } else {
      r = baseR; // 近休
    }
    shape.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 2,
  });
  geo.translate(0, 0, -thickness / 2);
  const cam = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.38 }),
  );
  group.add(cam);
  // 轮毂
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(baseR * 0.18, baseR * 0.18, thickness * 1.6, 20),
    new THREE.MeshStandardMaterial({ color, metalness: 0.65, roughness: 0.45 }),
  );
  hub.rotation.x = Math.PI / 2;
  group.add(hub);
  return group;
}

// ---------- 螺旋丝杠 ----------
export interface ScrewOptions {
  length: number;
  radius: number;
  lead: number; // 导程（转一圈前进距离）
  color: number;
}

/** 丝杠：杆身圆柱 + 螺旋螺纹（Tube 沿螺旋线） */
export function makeScrew({ length, radius, lead, color }: ScrewOptions): THREE.Group {
  const group = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, length, 20),
    new THREE.MeshStandardMaterial({ color: 0xc7d2e4, metalness: 0.85, roughness: 0.3 }),
  );
  group.add(shaft);

  // 螺旋线（管径 = 螺纹高）
  const turns = Math.ceil(length / lead) + 1;
  const pts: THREE.Vector3[] = [];
  const total = Math.min(turns, 14) * 2 * Math.PI;
  const res = 240;
  const threadR = radius * 0.72;
  for (let i = 0; i <= res; i++) {
    const a = (i / res) * total;
    const y = (a / (2 * Math.PI)) * lead - length / 2;
    if (y < -length / 2 - 0.1 || y > length / 2 + 0.1) continue;
    pts.push(new THREE.Vector3(Math.cos(a) * threadR, y, Math.sin(a) * threadR));
  }
  if (pts.length > 4) {
    const curve = new THREE.CatmullRomCurve3(pts);
    const threadGeo = new THREE.TubeGeometry(curve, pts.length, radius * 0.2, 8, false);
    const thread = new THREE.Mesh(
      threadGeo,
      new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.35 }),
    );
    group.add(thread);
  }
  return group;
}

/** 螺母：六角 + 内孔视觉 */
export function makeNut(radius: number, color: number): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.35, radius * 1.35, radius * 1.1, 6),
    new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.35 }),
  );
  group.add(body);
  return group;
}

// ---------- 曲柄连杆基础件 ----------
export function makeRod(length: number, width: number, thickness: number, color: number): THREE.Mesh {
  const rod = new THREE.Mesh(
    new THREE.BoxGeometry(length, width, thickness),
    new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 }),
  );
  return rod;
}

export function makeBlock(size: number, color: number, isSlider = false): THREE.Mesh {
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(size, size * 0.7, size * 0.8),
    new THREE.MeshStandardMaterial({
      color,
      metalness: isSlider ? 0.5 : 0.2,
      roughness: isSlider ? 0.45 : 0.6,
    }),
  );
  return block;
}

export function makePin(radius: number, height: number, color = 0xdde5f0): THREE.Mesh {
  const pin = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 16),
    new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.25 }),
  );
  pin.rotation.x = Math.PI / 2;
  return pin;
}

// ---------- 底板 / 支架 ----------
export function makeBase(size: [number, number, number], color = 0x1c2740): THREE.Mesh {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.75 }),
  );
  return base;
}
