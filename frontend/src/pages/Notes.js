import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NOTE_COLORS = ['#1a2235', '#1a2a1a', '#2a1a2a', '#2a2a1a', '#1a2535', '#251a1a'];
const CATEGORIES = ['general', 'aptitude', 'coding', 'interview'];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '', isPinned: false, color: NOTE_COLORS[0] });

  useEffect(() => { fetchNotes(); }, [search, filterCat]);

  const fetchNotes = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCat) params.category = filterCat;
      const { data } = await axios.get('/api/notes', { params });
      setNotes(data);
    } catch (e) {}
    setLoading(false);
  };

  const openCreate = () => {
    setEditNote(null);
    setForm({ title: '', content: '', category: 'general', tags: '', isPinned: false, color: NOTE_COLORS[0] });
    setShowModal(true);
  };

  const openEdit = (note) => {
    setEditNote(note);
    setForm({ title: note.title, content: note.content, category: note.category, tags: note.tags?.join(', '), isPinned: note.isPinned, color: note.color || NOTE_COLORS[0] });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editNote) {
        await axios.put(`/api/notes/${editNote._id}`, payload);
        toast.success('Note updated!');
      } else {
        await axios.post('/api/notes', payload);
        toast.success('Note created!');
      }
      setShowModal(false);
      fetchNotes();
    } catch (e) { toast.error('Failed to save note'); }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await axios.delete(`/api/notes/${id}`);
      toast.success('Note deleted');
      fetchNotes();
    } catch (e) {}
  };

  const togglePin = async (note) => {
    try {
      await axios.put(`/api/notes/${note._id}`, { ...note, isPinned: !note.isPinned });
      fetchNotes();
    } catch (e) {}
  };

  const catColors = { general: 'chip-info', aptitude: 'chip-purple', coding: 'chip-easy', interview: 'chip-medium' };
  const pinned = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  return (
    <div>
      <div className="page-header">
        <h2>📝 My Notes</h2>
        <p>Personal revision notes and important concepts</p>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input className="input" placeholder="🔍 Search notes..." style={{ maxWidth: 260, marginBottom: 0 }} value={search} onChange={e => setSearch(e.target.value)} />
            <select className="input" style={{ maxWidth: 160, marginBottom: 0 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Note</button>
        </div>

        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <>
            {pinned.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>📌 Pinned</div>
                <NoteGrid notes={pinned} onEdit={openEdit} onDelete={deleteNote} onPin={togglePin} catColors={catColors} />
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>All Notes</div>}
                <NoteGrid notes={unpinned} onEdit={openEdit} onDelete={deleteNote} onPin={togglePin} catColors={catColors} />
              </div>
            )}
            {notes.length === 0 && (
              <div className="empty-state card">
                <div className="icon">📝</div>
                <h3>No notes yet</h3>
                <p>Create your first note to start organizing your prep material!</p>
                <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: 16 }}>+ Create Note</button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editNote ? 'Edit Note' : 'New Note'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Title *</label>
                <input className="input" placeholder="Note title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Content</label>
                <textarea className="input" rows={8} placeholder="Write your notes here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Tags (comma separated)</label>
                  <input className="input" placeholder="arrays, recursion..." value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
              </div>
              <div style={{ height: 12 }} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Color:</span>
                {NOTE_COLORS.map(c => (
                  <div key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === c ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', outline: form.color === c ? '2px solid var(--accent-primary)' : 'none', outlineOffset: 2 }} />
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} /> Pin note
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary">💾 Save Note</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteGrid({ notes, onEdit, onDelete, onPin, catColors }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {notes.map(note => (
        <div key={note._id} style={{ background: note.color || 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, display: 'flex', flexDirection: 'column', minHeight: 160, transition: 'transform 0.2s', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1, marginRight: 8 }}>{note.title}</h4>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={() => onPin(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: note.isPinned ? 1 : 0.4 }}>📌</button>
              <button onClick={() => onEdit(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✏️</button>
              <button onClick={() => onDelete(note._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {note.content || 'No content'}
          </p>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={`chip ${catColors[note.category] || 'chip-info'}`} style={{ fontSize: 11 }}>{note.category}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
          {note.tags?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {note.tags.slice(0, 3).map(t => <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
