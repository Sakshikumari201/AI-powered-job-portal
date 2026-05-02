import React, { useState, useEffect } from 'react';
import httpClient from '../api/axios';
import PageWrapper from '../components/PageWrapper';
import { Plus, Trash2, ExternalLink, Briefcase } from 'lucide-react';

// The different status categories for the job board
const trackerColumns = ['Saved', 'Applied', 'Interviewing', 'Offers', 'Rejected'];

const JobTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ company: '', title: '', url: '', status: 'Saved' });
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  // Fetch all saved job applications for the current user
  const loadJobs = async () => {
    try {
      const res = await httpClient.get('/applications');
      setApplications(res.data);
    } catch (err) {
      setError('Oops! Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await httpClient.post('/applications', formData);
      setApplications([res.data, ...applications]);
      setShowForm(false);
      // Reset the form
      setFormData({ company: '', title: '', url: '', status: 'Saved' });
    } catch (err) {
      console.error('Create error:', err);
      alert('Something went wrong while saving the job.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this?')) return;
    try {
      await httpClient.delete(`/applications/${id}`);
      setApplications(applications.filter(app => app._id !== id));
    } catch (err) {
      alert('Delete failed. Try again.');
    }
  };

  const handleDrop = async (e, newStatus) => {
    const appId = e.dataTransfer.getData('appId');
    if (!appId) return;

    // Optimistic UI update
    const previous = [...applications];
    setApplications(apps => apps.map(app =>
      app._id === appId ? { ...app, status: newStatus } : app
    ));

    try {
      await httpClient.put(`/applications/${appId}`, { status: newStatus });
    } catch (err) {
      // Revert the UI if the backend request fails
      setApplications(previous);
      alert('Failed to update status on the server.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your job tracker...</div>;

  return (
    <PageWrapper className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-dark-card p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-dark-border transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Tracker</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop to manage your applications</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-md transition-transform duration-200 flex items-center gap-2 hover:scale-[1.03] active:scale-95"
        >
          <Plus size={16} /> Add Application
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-dark-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border flex flex-wrap gap-4 items-end animate-fade-in-up">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium">
              {trackerColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-transform duration-200 hover:scale-[1.03] active:scale-95 shadow-md">
            Save
          </button>
        </form>
      )}

      {error && <div className="text-red-500 text-center font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {trackerColumns.map(column => {
          const columnApps = applications.filter(a => a.status === column);
          return (
            <div
              key={column}
              className={`flex flex-col bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 min-w-[250px] min-h-[500px] border-2 transition-all duration-300 ${dragOverColumn === column ? 'border-indigo-400 bg-indigo-50/50 scale-[1.02] shadow-lg dark:border-indigo-600 dark:bg-indigo-900/20' : 'border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30'}`}
              onDragOver={e => { e.preventDefault(); setDragOverColumn(column); }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={e => {
                setDragOverColumn(null);
                handleDrop(e, column);
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-dark-border/50">
                <h3 className="font-bold text-gray-700 dark:text-gray-200">{column}</h3>
                <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded-lg text-xs font-semibold text-gray-500 shadow-sm border border-gray-100 dark:border-gray-700">
                  {columnApps.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 flex-1 h-full">
                {columnApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">No jobs {column.toLowerCase()} yet.</p>
                    {column === 'Saved' && <span className="text-xs text-indigo-400">Add jobs from recommendations.</span>}
                  </div>
                ) : (
                  columnApps.map(app => (
                    <div
                      key={app._id}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData('appId', app._id);
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={e => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-dark-border cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition-all duration-200 group relative z-10"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight pr-2">{app.title}</h4>
                        <button onClick={() => handleDelete(app._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/20 p-1 rounded-md">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">{app.company}</p>

                      {app.url && (
                        <a href={app.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 w-fit bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/40">
                          View details <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};

export default JobTracker;
