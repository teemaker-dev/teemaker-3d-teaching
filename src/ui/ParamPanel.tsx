// ===== 参数面板 =====
import { useStore } from '../store';
import { getConcept } from '../data/concepts';

export default function ParamPanel() {
  const conceptId = useStore((s) => s.conceptId);
  const params = useStore((s) => s.params);
  const setParam = useStore((s) => s.setParam);
  const running = useStore((s) => s.running);
  const toggleRunning = useStore((s) => s.toggleRunning);
  const autoRotate = useStore((s) => s.autoRotate);
  const toggleAutoRotate = useStore((s) => s.toggleAutoRotate);

  const concept = getConcept(conceptId);

  return (
    <div className="param-panel">
      <div className="panel-title">{concept.title}</div>
      <p className="principle">{concept.principle}</p>

      {concept.params.map((spec) => {
        const value = params[spec.key] ?? spec.default;
        return (
          <div key={spec.key} className="param-row">
            <div className="param-head">
              <span>{spec.label}</span>
              <span className="param-value">
                {value}
                {spec.unit ? ` ${spec.unit}` : ''}
              </span>
            </div>
            <input
              type="range"
              min={spec.min}
              max={spec.max}
              step={spec.step}
              value={value}
              onChange={(e) => setParam(spec.key, parseFloat(e.target.value))}
            />
          </div>
        );
      })}

      <div className="control-row">
        <button className={`ctrl-btn ${running ? 'on' : ''}`} onClick={toggleRunning}>
          {running ? '⏸ 暂停' : '▶ 运行'}
        </button>
        <button className={`ctrl-btn ${autoRotate ? 'on' : ''}`} onClick={toggleAutoRotate}>
          {autoRotate ? '⟳ 旋转开' : '⟳ 旋转关'}
        </button>
      </div>

      <p className="description">{concept.description}</p>
    </div>
  );
}
