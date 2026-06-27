import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Keys from './components/Keys';
import Logs from './components/Logs';

// Define the host URL. In development, target port 5000, in production it serves from the same domain.
const API_HOST = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('whyop_token') || '');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Projects list
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Active logs & keys lists
  const [keys, setKeys] = useState([]);
  const [logs, setLogs] = useState([]);

  // Toast notifier state
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper fetch parameters
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Verify and fetch user on start
  useEffect(() => {
    if (token) {
      fetch(`${API_HOST}/api/auth/me`, { headers: getHeaders() })
        .then((res) => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  // Fetch projects list
  const fetchProjects = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_HOST}/api/projects`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects);
        // Auto-select first project if none is selected
        if (data.projects.length > 0 && !selectedProject) {
          setSelectedProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  // Fetch keys and logs for selected project
  const fetchProjectData = async () => {
    if (!token || !selectedProject) return;
    try {
      // Fetch Keys
      const resKeys = await fetch(`${API_HOST}/api/keys?project_id=${selectedProject.id}`, { headers: getHeaders() });
      const dataKeys = await resKeys.json();
      if (resKeys.ok) {
        setKeys(dataKeys.keys);
      }

      // Fetch Logs
      const resLogs = await fetch(`${API_HOST}/api/logs?project_id=${selectedProject.id}`, { headers: getHeaders() });
      const dataLogs = await resLogs.json();
      if (resLogs.ok) {
        setLogs(dataLogs.logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Live Auto-Refresh (every 5 seconds) to make logs and dashboards feel alive
  useEffect(() => {
    fetchProjectData();
    const interval = setInterval(fetchProjectData, 5000);
    return () => clearInterval(interval);
  }, [token, selectedProject]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    showToast('Logged in successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('whyop_token');
    localStorage.removeItem('whyop_user');
    setToken('');
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
    setKeys([]);
    setLogs([]);
    showToast('Logged out.', 'error');
  };

  // Projects CRUD Actions
  const handleCreateProject = async (projData) => {
    try {
      const res = await fetch(`${API_HOST}/api/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(projData)
      });
      const data = await res.json();
      if (res.ok) {
        setProjects([data.project, ...projects]);
        setSelectedProject(data.project);
        showToast('Roblox Project created!');
      } else {
        showToast(data.error || 'Failed to create project', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handleUpdateProject = async (projectId, projData) => {
    try {
      const res = await fetch(`${API_HOST}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(projData)
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(projects.map((p) => (p.id === projectId ? data.project : p)));
        setSelectedProject(data.project);
        showToast('Roblox Script updated!');
      } else {
        showToast(data.error || 'Failed to update project', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`${API_HOST}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const remaining = projects.filter((p) => p.id !== projectId);
        setProjects(remaining);
        setSelectedProject(remaining.length > 0 ? remaining[0] : null);
        showToast('Project deleted successfully.');
      } else {
        showToast('Failed to delete project', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Keys Handlers
  const handleGenerateKeys = async (keyGenData) => {
    try {
      const res = await fetch(`${API_HOST}/api/keys/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(keyGenData)
      });
      const data = await res.json();
      if (res.ok) {
        setKeys([...data.keys, ...keys]);
        showToast(data.message);
        fetchProjectData();
      } else {
        showToast(data.error || 'Failed to generate keys', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handleUpdateKey = async (keyId, keyUpdateData) => {
    try {
      const res = await fetch(`${API_HOST}/api/keys/${keyId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(keyUpdateData)
      });
      const data = await res.json();
      if (res.ok) {
        setKeys(keys.map((k) => (k.id === keyId ? data.key : k)));
        showToast(data.message || 'Key configuration updated.');
        fetchProjectData();
      } else {
        showToast(data.error || 'Failed to update key', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const handleDeleteKey = async (keyId) => {
    try {
      const res = await fetch(`${API_HOST}/api/keys/${keyId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setKeys(keys.filter((k) => k.id !== keyId));
        showToast('License Key deleted successfully.');
      } else {
        showToast('Failed to delete key', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Loader screen if session check is ongoing
  if (token && !user) {
    return (
      <div className="overlay-loader" style={{ height: '100vh' }}>
        <div className="spinner"></div>
        <span>Syncing dev portal session...</span>
      </div>
    );
  }

  // Auth/Login View
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} host={API_HOST} />;
  }

  // App Layout
  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        onLogout={handleLogout}
      />

      {/* Main dashboard screens switch */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard selectedProject={selectedProject} keys={keys} logs={logs} />
        )}
        {activeTab === 'projects' && (
          <Projects
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            host={API_HOST}
          />
        )}
        {activeTab === 'keys' && (
          <Keys
            keys={keys}
            selectedProject={selectedProject}
            onGenerateKeys={handleGenerateKeys}
            onUpdateKey={handleUpdateKey}
            onDeleteKey={handleDeleteKey}
          />
        )}
        {activeTab === 'logs' && (
          <Logs logs={logs} selectedProject={selectedProject} />
        )}
      </main>

      {/* Slide-out micro-toast */}
      {toast && (
        <div className={`alert-toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.type === 'error' ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
