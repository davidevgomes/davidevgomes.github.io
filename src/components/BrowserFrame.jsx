export default function BrowserFrame({ url, children, className = '' }) {
  return (
    <div className={'browser ' + className}>
      <div className="browser__bar mono" aria-hidden="true">
        <span className="browser__dots"><i /><i /><i /></span>
        <span className="browser__url">{url}</span>
      </div>
      {children}
    </div>
  )
}
