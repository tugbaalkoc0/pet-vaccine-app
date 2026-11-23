export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} disabled={loading}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Vazgeç
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? 'Siliniyor...' : 'Sil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
