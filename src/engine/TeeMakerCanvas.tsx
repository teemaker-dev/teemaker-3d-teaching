// ===== 通用 3D 画布 =====
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { animClock } from './AnimationDriver';
import { useStore } from '../store';
import { getConcept } from '../data/concepts';

function Scene() {
  const concept = useStore((s) => getConcept(s.conceptId));
  const params = useStore((s) => s.params);
  const running = useStore((s) => s.running);

  useFrame((_, delta) => {
    if (running) animClock.current += delta;
  });

  const RenderComp = concept.render;
  return <RenderComp params={params} time={animClock.current} />;
}

export default function TeeMakerCanvas() {
  const autoRotate = useStore((s) => s.autoRotate);
  return (
    <Canvas
      camera={{ position: [4.2, 3.2, 5.5], fov: 45 }}
      style={{ background: '#0b1020' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} color="#88bbff" />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffd9a0" />
      <Scene />
      <OrbitControls autoRotate={autoRotate} autoRotateSpeed={1.6} enableDamping />
    </Canvas>
  );
}
