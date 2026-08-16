import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { archiveFinanceCategory, createFinanceCategory, getFinanceCategories, renameFinanceCategory } from '@db/queries/categories.service'
import { INP, Section, Toast, onBlur, onFocus } from './_shared'

function CategoriesTab() {
  var [categories, setCategories] = useState([])
  var [loading,     setLoading]   = useState(true)
  var [newName,     setNewName]   = useState('')
  var [adding,      setAdding]    = useState(false)
  var [renamingId,  setRenamingId] = useState(null)
  var [renameVal,   setRenameVal]  = useState('')
  var [toast,       setToast]      = useState(null)

  function showMsg(msg, type) {
    setToast({ msg: msg, type: type || 'success' })
    setTimeout(function() { setToast(null) }, 3000)
  }

  function load() {
    setLoading(true)
    getFinanceCategories()
      .then(function(data) { setCategories(data) })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setLoading(false) })
  }

  useEffect(function() { load() }, [])

  function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    createFinanceCategory(newName.trim())
      .then(function(cat) {
        setCategories(function(prev) { return prev.concat([cat]) })
        setNewName('')
        showMsg('Categoria anadida')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
      .finally(function() { setAdding(false) })
  }

  function handleRename(id) {
    if (!renameVal.trim()) { setRenamingId(null); return }
    renameFinanceCategory(id, renameVal.trim())
      .then(function(updated) {
        setCategories(function(prev) { return prev.map(function(c) { return c.id === id ? updated : c }) })
        setRenamingId(null)
        showMsg('Categoria actualizada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  function handleArchive(id) {
    if (!window.confirm('Eliminar esta categoria? Los movimientos que ya la usan la conservaran en su historial.')) return
    archiveFinanceCategory(id)
      .then(function() {
        setCategories(function(prev) { return prev.filter(function(c) { return c.id !== id }) })
        showMsg('Categoria eliminada')
      })
      .catch(function(e) { showMsg(e.message, 'error') })
  }

  return (
    <div>
      <Toast toast={toast} />

      <Section title="Categorias de Finanzas" description="Las que veras al elegir la categoria de un movimiento">
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={newName}
            onChange={function(e) { setNewName(e.target.value) }}
            placeholder="Nombre de la nueva categorÃ­a"
            style={INP}
            onKeyDown={function(e) { if (e.key === 'Enter') handleAdd() }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <button type="button" onClick={handleAdd} disabled={adding || !newName.trim()}
            style={{ padding: '9px 18px', borderRadius: '8px', background: 'var(--gradient-brand)', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: adding || !newName.trim() ? 'not-allowed' : 'pointer', opacity: adding || !newName.trim() ? 0.6 : 1, whiteSpace: 'nowrap', flexShrink: 0 }}
          >Anadir</button>
        </div>
      </Section>

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-4)' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map(function(cat) {
            var isRenaming = renamingId === cat.id
            return (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                {isRenaming ? (
                  <input
                    value={renameVal}
                    onChange={function(e) { setRenameVal(e.target.value) }}
                    onBlur={function() { handleRename(cat.id) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setRenamingId(null) }}
                    autoFocus
                    style={Object.assign({}, INP, { flex: 1 })}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-1)' }}>{cat.name}</span>
                )}
                {!isRenaming && (
                  <>
                    <button type="button" onClick={function() { setRenameVal(cat.name); setRenamingId(cat.id) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', borderRadius: '6px', fontSize: '13px' }}
                    >âœŽ</button>
                    <button type="button" onClick={function() { handleArchive(cat.id) }}
                      style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(230,57,70,0.5)', borderRadius: '6px' }}
                    ><Trash2 style={{ width: '13px', height: '13px' }} /></button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


export default CategoriesTab

