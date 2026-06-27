import React, { useState } from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  projects,
  selectedProject,
  setSelectedProject,
  onLogout
}) {
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyApiKey = () => {
    if (!user?.api_key) return;
    navigator.clipboard.writeText(user.api_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/whyop.gif" alt="logo" style={{ height: '32px', width: '32px', borderRadius: '6px', objectFit: 'cover' }} />
        <span>why.op</span>
      </div>

      {/* Project Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '8px'
          }}
        >
          Active Project
        </label>
        <select
          className="project-selector"
          style={{ width: '100%' }}
          value={selectedProject ? selectedProject.id : ''}
          onChange={(e) => {
            const proj = projects.find((p) => p.id === parseInt(e.target.value, 10));
            setSelectedProject(proj || null);
          }}
        >
          {projects.length === 0 ? (
            <option value="">No Projects Created</option>
          ) : (
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Navigation Menu */}
      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Dashboard
        </li>
        <li
          className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          Projects / Scripts
        </li>
        <li
          className={`sidebar-item ${activeTab === 'keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('keys')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Licenses / Keys
        </li>
        <li
          className={`sidebar-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 20h9M3 20v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8M3 12V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" />
            <path d="M14 12V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
          </svg>
          Handshake Logs
        </li>
      </ul>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.username?.substring(0, 2).toUpperCase() || 'DV'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.username || 'Developer'}</span>
            <span className="user-role">Premium Seller</span>
          </div>
        </div>

        {/* Copy API key link */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={handleCopyApiKey}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              textAlign: 'left',
              padding: '4px 0'
            }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copiedKey ? 'API Key Copied!' : 'Copy API key'}
          </button>
        </div>

        <button
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px 0', fontSize: '0.85rem' }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
