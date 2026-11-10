import CaseIDR from './CaseIDR'
import CaseDashpoint from './CaseDashpoint'

export default function Work() {
  return (
    <section id="work" className="work" data-pose="work" aria-labelledby="work-title">
      <div className="work__head section">
        <div className="section-head mono">
          <span><span className="idx">04</span> — Projetos selecionados</span>
          <span className="dim">02 estudos de caso</span>
        </div>
        <h2 id="work-title" className="display h-xl work__title" data-reveal="chars">
          Projetos <em className="serif accent">selecionados</em>
        </h2>
        <p className="lead work__lead" data-reveal="lines">
          Sistemas reais para o setor público e um produto próprio — do problema à entrega.
        </p>
      </div>
      <CaseIDR />
      <CaseDashpoint />
    </section>
  )
}
