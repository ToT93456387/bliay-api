import React from 'react';

export default function Logs({ logs, selectedProject }) {
  if (!selectedProject) {
    return (
      <div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '10px' }}>Verification Logs</h2>
        <div className="card-glass" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Please select or create a project first before reviewing logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Handshake Audit Logs</h2>
          <p style={{ fontSize: '0.9rem' }}>Review connection events, success ratios, and blocked devices.</p>
        </div>
      </div>

      <div className="card-glass" style={{ padding: '24px 0 0 0' }}>
        <h3 className="card-title" style={{ padding: '0 24px 20px 24px', margin: 0, borderBottom: '1px solid var(--border-subtle)' }}>
          <span>Recent Verification Requests (Max 100)</span>
        </h3>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            No verification attempts recorded yet for this script project.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>License Key</th>
                  <th>Client HWID</th>
                  <th>IP Address</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`action-badge ${log.action === 'auth_success' ? 'action-success' : 'action-failed'}`}>
                        {log.action.replace('auth_', '').replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="copyable-key" style={{ fontSize: '0.8rem' }}>
                        {log.key_string || 'Invalid Key'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {log.hwid || 'Unknown'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{log.ip}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{log.details || '-'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
