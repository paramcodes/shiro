import { useEffect, useRef, useState } from 'react';
import { Tldraw, Editor } from '@tldraw/tldraw';
// @ts-ignore
import '@tldraw/tldraw/tldraw.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Layout, ArrowLeft } from 'lucide-react';

export const BoardEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<Editor | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [role, setRole] = useState<string>('editor');

  useEffect(() => {
    if (!id) return;

    const ws = new WebSocket(`ws://${window.location.host}/?boardId=${id}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const editor = editorRef.current;

      if (message.type === 'init') {
        if (message.role) {
          setRole(message.role);
          if (message.role === 'viewer' && editor) {
            editor.updateInstanceState({ isReadonly: true });
          }
        }
        if (message.payload && editor) {
          try {
            const state = JSON.parse(message.payload);
            (editor as any).loadSnapshot(state);
          } catch (e) {
            console.error('Failed to load tldraw state', e);
          }
        }
      } else if (message.type === 'update') {
        if (message.payload && editor) {
          try {
            const state = JSON.parse(message.payload);
            (editor as any).loadSnapshot(state);
          } catch (e) {
            console.error('Failed to update tldraw state', e);
          }
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [id]);

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;

    if (role === 'viewer') {
      editor.updateInstanceState({ isReadonly: true });
    }

    editor.store.listen((change: any) => {
      if (role === 'viewer') return;
      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        if (change.source === 'local') {
          const snapshot = JSON.stringify((editor as any).getSnapshot());
          ws.send(JSON.stringify({
            type: 'update',
            payload: snapshot
          }));
        }
      }
    });
  };

  const loadTemplate = (type: 'brainstorm' | 'retro' | 'flowchart') => {
    const editor = editorRef.current;
    if (!editor || role === 'viewer') return;

    if (type === 'brainstorm') {
      editor.createShapes([
        { id: 'shape:1' as any, type: 'geo', x: 100, y: 100, props: { w: 200, h: 150 } },
        { id: 'shape:2' as any, type: 'geo', x: 350, y: 100, props: { w: 200, h: 150 } },
        { id: 'shape:3' as any, type: 'geo', x: 600, y: 100, props: { w: 200, h: 150 } },
      ] as any);
    } else if (type === 'retro') {
      editor.createShapes([
        { id: 'shape:r1' as any, type: 'geo', x: 100, y: 100, props: { w: 250, h: 300 } },
        { id: 'shape:r2' as any, type: 'geo', x: 380, y: 100, props: { w: 250, h: 300 } },
        { id: 'shape:r3' as any, type: 'geo', x: 660, y: 100, props: { w: 250, h: 300 } },
      ] as any);
    } else if (type === 'flowchart') {
      editor.createShapes([
        { id: 'shape:f1' as any, type: 'geo', x: 200, y: 150, props: { w: 180, h: 100, geo: 'rectangle' } },
        { id: 'shape:f2' as any, type: 'geo', x: 500, y: 150, props: { w: 180, h: 100, geo: 'ellipse' } },
      ] as any);
    }
  };

  const handleExport = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const snapshot = JSON.stringify((editor as any).getSnapshot(), null, 2);
    const blob = new Blob([snapshot], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ height: '50px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '0 1rem', background: '#ffffff', zIndex: 1000, gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Board: {id?.slice(0, 8)}...</span>
          <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.5rem', background: role === 'viewer' ? '#fef3c7' : '#dcfce7', color: role === 'viewer' ? '#92400e' : '#166534', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            {role}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {role !== 'viewer' && (
            <>
              <button onClick={() => loadTemplate('brainstorm')} style={{ padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Layout size={14} /> Brainstorm Template
              </button>
              <button onClick={() => loadTemplate('retro')} style={{ padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Retro Template
              </button>
              <button onClick={() => loadTemplate('flowchart')} style={{ padding: '0.4rem 0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Flowchart Template
              </button>
            </>
          )}
          <button onClick={handleExport} style={{ padding: '0.4rem 0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Tldraw 
          autoFocus 
          onMount={handleMount}
        />
      </div>
    </div>
  );
};
