import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Trash2, Edit2, Layout } from 'lucide-react';

interface Board {
  id: string;
  name: string;
}

export const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState<{id: string, name: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      const data = await res.json();
      if (data.boards) setBoards(data.boards);
    } catch (e) {
      console.error("Failed to fetch boards", e);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBoardName }),
      });
      if (res.ok) {
        setNewBoardName('');
        setIsModalOpen(false);
        await fetchBoards();
      }
    } catch (e) {
      console.error("Failed to create board", e);
    }
  };

  const handleRenameBoard = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setEditingBoard(null);
        await fetchBoards();
      }
    } catch (e) {
      console.error("Failed to rename board", e);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this board?')) return;
    try {
      const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchBoards();
      }
    } catch (e) {
      console.error("Failed to delete board", e);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layout size={24} /> My Boards
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            backgroundColor: '#000', color: '#fff', border: 'none', padding: '0.5rem 1rem', 
            borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' 
          }}
        >
          <Plus size={18} /> New Board
        </button>
      </header>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' 
      }}>
        {boards.map(board => (
          <div 
            key={board.id} 
            style={{ 
              border: '1px solid #ddd', borderRadius: '12px', padding: '1rem', 
              position: 'relative', cursor: 'pointer', transition: 'box-shadow 0.2s',
              backgroundColor: '#fff'
            }}
            onClick={() => navigate(`/board/${board.id}`)}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {editingBoard?.id === board.id ? (
                <input 
                  autoFocus
                  value={editingBoard.name}
                  onChange={e => setEditingBoard({ ...editingBoard, name: e.target.value })}
                  onBlur={() => handleRenameBoard(board.id, editingBoard.name)}
                  onKeyDown={e => e.key === 'Enter' && handleRenameBoard(board.id, editingBoard.name)}
                  style={{ border: '1px solid #007aff', borderRadius: '4px', padding: '2px 4px', fontSize: '1rem' }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{board.name}</span>
              )}
              
              <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setEditingBoard({ id: board.id, name: board.name })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteBoard(board.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#dc3545' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {boards.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', padding: '3rem' }}>
            No boards found. Create your first one!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
        }}>
          <form 
            onSubmit={handleCreateBoard}
            style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
          >
            <h2 style={{ marginTop: 0, fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Board</h2>
            <input 
              autoFocus
              placeholder="Board name..."
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
