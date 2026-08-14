export default function DocumentsNotion() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>📄 Documentos</h1>
      <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px' }}>
        A powerful Notion-like document editor with real-time collaboration
      </p>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Coming Soon</h2>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>✓ Notion-style "/" commands</li>
          <li style={{ marginBottom: '10px' }}>✓ Real-time collaborative editing</li>
          <li style={{ marginBottom: '10px' }}>✓ Tables, charts, calendars, and more</li>
          <li>✓ Shared with team and clients</li>
        </ul>
      </div>
    </div>
  )
}
