import React from 'react';

export default function Dashboard({ selectedProject, keys, logs }) {
  if (!selectedProject) {
    return (
      <div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '10px' }}>Dashboard Overview</h2>
        <div className="card-glass" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--text-dark)', marginBottom: '16px' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No Active Project Selected</h3>
          <p>Please navigate to "Projects / Scripts" and create your first Roblox project to begin.</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalKeys = keys.length;
  const activeKeys = keys.filter((k) => k.status === 'active').length;
  const suspendedKeys = keys.filter((k) => k.status === 'suspended').length;
  const boundKeys = keys.filter((k) => k.hwid !== null && k.hwid !== '').length;

  const totalLogs = logs.length;
  const successLogs = logs.filter((l) => l.action === 'auth_success').length;
  const failedLogs = totalLogs - successLogs;

  // Get recent 5 activities
  const recentLogs = logs.slice(0, 5);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>
            Overview for <span style={{ color: 'var(--accent-cyan)' }}>{selectedProject.name}</span>
          </h2>
          <p style={{ fontSize: '0.9rem' }}>Realtime security analytics and license performance monitoring.</p>
        </div>
      </div>

      {/* Analytics Counter Grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-info">
            <h3>Total Licenses</h3>
            <div className="value">{totalKeys}</div>
          </div>
          <div className="stats-icon cyan">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <h3>Active / Bound</h3>
            <div className="value">{activeKeys} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ {boundKeys} bound</span></div>
          </div>
          <div className="stats-icon green">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <h3>Suspended</h3>
            <div className="value">{suspendedKeys}</div>
          </div>
          <div className="stats-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-info">
            <h3>Handshakes (Logs)</h3>
            <div className="value">{totalLogs} <span style={{ fontSize: '0.85rem', color: 'var(--accent-red)' }}>({failedLogs} blocked)</span></div>
          </div>
          <div className="stats-icon purple">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Verification Monitor Table */}
      <div className="card-glass">
        <h3 className="card-title">
          <span>Security Alert Monitor</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>Latest 5 Access Actions</span>
        </h3>

        {recentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            No handshakes have been recorded for this script yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>License Key</th>
                  <th>HWID</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
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
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
