import React, { useState } from 'react';

export default function Projects({
  projects,
  selectedProject,
  setSelectedProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  host
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rawScript, setRawScript] = useState('');
  
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const startCreate = () => {
    setName('');
    setDescription('');
    setRawScript('-- Put your Roblox Lua Script here\nprint("Hello from protected script!")\n');
    setIsCreating(true);
  };

  const startEdit = () => {
    if (!selectedProject) return;
    setName(selectedProject.name);
    setDescription(selectedProject.description);
    setRawScript(selectedProject.raw_script);
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isCreating) {
      await onCreateProject({ name, description, raw_script: rawScript });
      setIsCreating(false);
    } else {
      await onUpdateProject(selectedProject.id, { name, description, raw_script: rawScript });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${selectedProject.name}"? All associated keys and logs will be permanently deleted.`)) {
      onDeleteProject(selectedProject.id);
    }
  };

  // Generation snippets
  const cleanHost = host.startsWith('http') ? host : `${window.location.protocol}//${host}`;

  const shortLoaderCode = `_G.Key = "YOUR-LICENSE-KEY"
local success, response = pcall(function()
    return game:HttpPost("${cleanHost}/api/v1/verify", game:GetService("HttpService"):JSONEncode({
        key = _G.Key,
        hwid = game:GetService("RbxAnalyticsService"):GetClientId()
    }), "application/json")
end)
if success and response then
    local data = game:GetService("HttpService"):JSONDecode(response)
    if data.success and data.script then
        loadstring(data.script)()
    else
        warn("Auth failed: " .. tostring(data.message))
    end
else
    warn("Auth Server Offline")
end`;

  const fullLoaderCode = `-- Advanced Secure Lua Loader
_G.Key = "YOUR-LICENSE-KEY"

local hostUrl = "${cleanHost}"
local clientHwid = "Unknown"
pcall(function()
    clientHwid = gethwid and gethwid() or game:GetService("RbxAnalyticsService"):GetClientId()
end)

local success, response = pcall(function()
    return request({
        Url = hostUrl .. "/api/v1/verify",
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = game:GetService("HttpService"):JSONEncode({ key = _G.Key, hwid = clientHwid })
    })
end)

if success and response and response.StatusCode == 200 then
    local data = game:GetService("HttpService"):JSONDecode(response.Body)
    if data.success and data.script then
        print("[Loader] Verified! Running execution payload.")
        loadstring(data.script)()
    else
        warn("[Auth Denied] " .. tostring(data.message))
    end
else
    warn("[Loader Error] Connection Handshake Failed.")
end`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'short') {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } else {
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Projects / Roblox Scripts</h2>
          <p style={{ fontSize: '0.9rem' }}>Deploy security updates and retrieve executor loaders.</p>
        </div>
        {!isCreating && !isEditing && (
          <button className="btn btn-primary" onClick={startCreate}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Project
          </button>
        )}
      </div>

      {isCreating || isEditing ? (
        <form onSubmit={handleSave} className="card-glass">
          <h3 className="card-title">{isCreating ? 'Create Roblox Project' : `Edit Script: ${selectedProject.name}`}</h3>
          
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jailbreak Premium Hack"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short notes about this Roblox script"
            />
          </div>

          <div className="form-group">
            <label>Roblox Lua Execution Script Payload</label>
            <div className="code-editor-container">
              <div className="code-editor-header">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Roblox Execution Script</span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>LUA SYNTAX</span>
              </div>
              <textarea
                className="code-textarea"
                required
                value={rawScript}
                onChange={(e) => setRawScript(e.target.value)}
                placeholder="-- Put script logic to execute when verification passes..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Project
            </button>
          </div>
        </form>
      ) : !selectedProject ? (
        <div className="card-glass" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--text-dark)', marginBottom: '16px' }}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No Scripts Found</h3>
          <p style={{ marginBottom: '20px' }}>To start generating keys, create a project enclosing your Roblox exploit payload.</p>
          <button className="btn btn-primary" onClick={startCreate}>
            Create First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main Info */}
          <div className="card-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '6px' }}>{selectedProject.name}</h3>
                <p style={{ fontSize: '0.95rem' }}>{selectedProject.description || 'No description provided.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={startEdit}>
                  Edit Script
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Project
                </button>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Active Script Code Length:</h4>
              <span className="copyable-key" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem' }}>
                {selectedProject.raw_script.length} characters (Lua payload size)
              </span>
            </div>
          </div>

          {/* Loader Snippets */}
          <div className="card-glass">
            <h3 className="card-title">Roblox Client Loader Templates</h3>
            <p style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
              Select and copy the loader code template. Paste this template into your public Roblox script deployment so buyers can input their keys.
            </p>

            <div className="stats-grid" style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
              {/* Short loader */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: '#06b6d4' }}>1. Compact Handshake Loader</h4>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => copyToClipboard(shortLoaderCode, 'short')}>
                    {copiedShort ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '12px', background: '#080b13', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#94a3b8' }}>
                  {shortLoaderCode}
                </pre>
              </div>

              {/* Full loader */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: '#a855f7' }}>2. Full Executor-compatible Secure Loader</h4>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => copyToClipboard(fullLoaderCode, 'full')}>
                    {copiedFull ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '12px', background: '#080b13', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#94a3b8' }}>
                  {fullLoaderCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
