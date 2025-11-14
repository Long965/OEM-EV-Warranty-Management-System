export default function Modal({ open, title, onClose, children, footer }){
  if (!open) return null
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__panel" onClick={(e)=>e.stopPropagation()}>
        <div className="modal__head">
          <div className="modal__title">{title}</div>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body">{children}</div>
        <div className="modal__foot">
          {footer || <button className="btn btn-outline" onClick={onClose}>Đóng</button>}
        </div>
      </div>
    </div>
  )
}
