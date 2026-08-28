// ===== 教学要点卡 =====
import { getConcept } from '../data/concepts';
import { useStore } from '../store';

export default function TeachingCard() {
  const conceptId = useStore((s) => s.conceptId);
  const concept = getConcept(conceptId);
  return (
    <div className="teaching-card">
      <div className="panel-title">教学要点</div>
      {concept.teaching.map((t, i) => (
        <div key={i} className="teaching-item">
          <div className="teaching-title">
            <span className="teaching-num">{i + 1}</span> {t.title}
          </div>
          <p className="teaching-body">{t.body}</p>
        </div>
      ))}
    </div>
  );
}
