export function Card({ title, actions, children }) {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h3>{title}</h3>
          <div className="card-actions">{actions}</div>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )}

export function Table({ columns = [], rows = [] }) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key || c.label}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {columns.map((c) => <td key={c.key || c.label}>{c.render ? c.render(r, idx) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-secondary" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function FormInput({ label, type = 'text', value, onChange, ...rest }) {
  const id = rest.id || label
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} type={type} value={value} onChange={onChange} {...rest} />
    </label>
  )
}

export function Button({ children, variant = 'primary', ...rest }) {
  return <button className={`btn ${variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`} {...rest}>{children}</button>
}



