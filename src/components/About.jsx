import { about, profile } from '../data/site'

export default function About() {
  return (
    <section id="about" className="section about" data-pose="about" aria-labelledby="about-title">
      <div className="section-head mono">
        <span><span className="idx">02</span> — Sobre</span>
        <span className="dim">Perfil &amp; trajetória</span>
      </div>

      <div className="grid about__grid">
        <figure className="about__portrait">
          <div className="about__portrait-img" data-reveal="img">
            <img src="/img/retrato.webp" width="776" height="930" alt="Retrato de Davi Gomes Araújo" loading="lazy" decoding="async" />
          </div>
          <figcaption className="mono dim">
            <span>Fig. 01</span>
            <span>{profile.location}</span>
          </figcaption>
        </figure>

        <div className="about__text">
          <h2 id="about-title" className="about__lead lead" data-reveal="lines">
            {about.lead[0]} <em className="serif accent">{about.lead[1]}</em>
          </h2>
          <div className="about__cols">
            {about.paragraphs.map((p, i) => (
              <p className="body" key={i} data-reveal="fade">{p}</p>
            ))}
          </div>

          <div className="about__path mono" data-reveal="fade" aria-label="Trajetória: da infraestrutura aos produtos">
            {about.path.map((step, i) => (
              <span key={step} className={i === about.path.length - 1 ? 'accent' : ''}>
                {step}
                {i < about.path.length - 1 && <i aria-hidden="true">→</i>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid about__edu">
        <h3 className="mono dim about__edu-title">Formação</h3>
        <ul className="about__edu-list">
          {about.education.map((e, i) => (
            <li key={e.title} className="edu" data-reveal="fade">
              <span className="mono dim">{String(i + 1).padStart(2, '0')}</span>
              <span className="edu__title">{e.title}</span>
              <span className="edu__place">{e.place}</span>
              <span className={'mono edu__note' + (i === 0 ? ' accent' : ' dim')}>{e.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="about__photos">
        {about.photos.map((ph, i) => (
          <figure className={'about__photo about__photo--' + (i + 1)} key={ph.src} data-speed={i === 0 ? 0.35 : -0.5}>
            <div data-reveal="img">
              <img src={ph.src} width={ph.w} height={ph.h} alt={ph.caption} loading="lazy" decoding="async" />
            </div>
            <figcaption className="mono dim">
              <span>Fig. 0{i + 2}</span>
              <span>{ph.caption}</span>
            </figcaption>
          </figure>
        ))}
        <p className="about__quote" data-reveal="lines">
          Do <em className="serif">cabo de rede</em> ao <em className="serif">deploy</em> — gosto de entender a peça inteira.
        </p>
      </div>
    </section>
  )
}
