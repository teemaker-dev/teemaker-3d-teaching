import TeeMakerCanvas from './engine/TeeMakerCanvas';
import ConceptPicker from './ui/ConceptPicker';
import ParamPanel from './ui/ParamPanel';
import TeachingCard from './ui/TeachingCard';
import ErrorBoundary from './ui/ErrorBoundary';

const PIPELINE = ['输入概念', '解析结构', '生成几何', '装配运动', '附加教学', '输出教具'];

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          3D 教具生成器
        </div>
        <div className="pipeline">
          {PIPELINE.map((step, i) => (
            <span key={step} className="pipeline-step">
              <span className="pipeline-tag">{step}</span>
              {i < PIPELINE.length - 1 && <span className="pipeline-arrow">→</span>}
            </span>
          ))}
        </div>
      </header>

      <div className="layout">
        <aside className="left">
          <ConceptPicker />
          <ParamPanel />
        </aside>
        <main className="stage">
          <ErrorBoundary>
            <TeeMakerCanvas />
          </ErrorBoundary>
        </main>
        <aside className="right">
          <TeachingCard />
        </aside>
      </div>
    </div>
  );
}
