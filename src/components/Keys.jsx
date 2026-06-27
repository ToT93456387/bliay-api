import React, { useState } from 'react';

export default function Keys({ keys, selectedProject, onGenerateKeys, onUpdateKey, onDeleteKey }) {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Generate Form state
  const [count, setCount] = useState('5');
  const [duration, setDuration] = useState('0'); // 0 means lifetime
  const [customDays, setCustomDays] = useState('7');

  const [copiedKeyId, setCopiedKeyId] = useState(null);

  if (!selectedProject) {
    return (
      <div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '10px' }}>License Management</h2>
        <div className="card-glass" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Please select or create a project first before managing keys.</p>
        </div>
      </div>
    );
  }

  const handleGenerate = async (e) => {
    e.preventDefault();
    let days = parseFloat(duration);
    if (duration === 'custom') {
      days = parseFloat(customDays) || 0;
    }
    await onGenerateKeys({
      project_id: selectedProject.id,
      count: parseInt(count, 10),
      duration_days: days
    });
    setShowGenerateModal(false);
  };

  const handleCopy = (keyString, id) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Filter keys by search term
  const filteredKeys = keys.filter(
    (k) =>
      k.key_string.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (k.hwid && k.hwid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>License Keys</h2>
          <p style={{ fontSize: '0.9rem' }}>Generate, toggle, delete, or reset HWID locks.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
            placeholder="Search key or HWID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Generate Keys
          </button>
        </div>
      </div>

      <div className="card-glass" style={{ padding: '24px 0 0 0' }}>
        <h3 className="card-title" style={{ padding: '0 24px 20px 24px', margin: 0, borderBottom: '1px solid var(--border-subtle)' }}>
          <span>Active Licenses ({filteredKeys.length})</span>
        </h3>

        {filteredKeys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            No keys found matching details.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Key String</th>
                  <th>Status</th>
                  <th>Expiration</th>
                  <th>Hardware ID (HWID)</th>
                  <th>Last Executed</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <div
                        className="copyable-key"
                        onClick={() => handleCopy(k.key_string, k.id)}
                        style={{ cursor: 'pointer' }}
                        title="Click to copy key"
                      >
                        {k.key_string}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {copiedKeyId === k.id ? 'Copied' : 'Copy'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${k.status === 'active' ? 'badge-active' : 'badge-suspended'}`}>
                        {k.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {k.expires_at ? new Date(k.expires_at).toLocaleString() : 'Lifetime'}
                    </td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {k.hwid ? (
                        <span title={k.hwid}>{k.hwid}</span>
                      ) : (
                        <span style={{ color: 'var(--text-dark)', fontStyle: 'italic' }}>Not Bound Yet</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {k.last_used ? new Date(k.last_used).toLocaleString() : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {k.hwid && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => onUpdateKey(k.id, { reset_hwid: true })}
                            title="Reset locked Hardware ID"
                          >
                            Reset HWID
                          </button>
                        )}
                        <button
                          className={`btn ${k.status === 'active' ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() =>
                            onUpdateKey(k.id, {
                              status: k.status === 'active' ? 'suspended' : 'active'
                            })
                          }
                        >
                          {k.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px', borderRadius: '6px' }}
                          onClick={() => {
                            if (window.confirm('Delete this license key permanently?')) {
                              onDeleteKey(k.id);
                            }
                          }}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate keys modal */}
      {showGenerateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Bulk Generate Keys</h3>
              <button
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}
                onClick={() => setShowGenerateModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Number of Keys to Generate</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Key Expiration Duration</label>
                <select
                  className="form-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="0">Lifetime Access (Never Expires)</option>
                  <option value="0.0416">1 Hour</option>
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="365">1 Year</option>
                  <option value="custom">Custom Days...</option>
                </select>
              </div>

              {duration === 'custom' && (
                <div className="form-group">
                  <label>Duration in Days</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
