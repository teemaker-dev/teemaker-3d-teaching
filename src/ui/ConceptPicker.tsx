// ===== 概念选择器 =====
import { useStore } from '../store';
import { CONCEPTS } from '../data/concepts';

export default function ConceptPicker() {
  const conceptId = useStore((s) => s.conceptId);
  const setConcept = useStore((s) => s.setConcept);
  return (
    <div className="concept-picker">
      <div className="picker-label">选择概念</div>
      <div className="picker-grid">
        {CONCEPTS.map((c) => (
          <button
            key={c.id}
            className={`concept-btn ${c.id === conceptId ? 'active' : ''}`}
            onClick={() => setConcept(c.id)}
          >
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}
