import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Settings, Bell, LogOut, Users, Download, Tag, FileText, Zap, Plug, Wifi, AlertCircle } from 'lucide-react'

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('mi-perfil')

  if (!isOpen) return null

  const tabs = [
    { id: 'cuenta', label: 'Cuenta', items: [
      { id: 'mi-perfil', label: 'Mi perfil', icon: User },
      { id: 'preferencias', label: 'Preferencias', icon: Settings },
      { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
      { id: 'cuenta-sesion', label: 'Cuenta y sesión', icon: LogOut },
      { id: 'legal', label: 'Legal', icon: AlertCircle },
    ]},
    { id: 'espacio', label: 'Espacio de trabajo', items: [
      { id: 'general', label: 'General', icon: Settings },
      { id: 'personas', label: 'Personas', icon: Users },
      { id: 'importar', label: 'Importar', icon: Download },
      { id: 'categorias', label: 'Categorías', icon: Tag },
      { id: 'plantillas', label: 'Plantillas', icon: FileText },
    ]},
    { id: 'funciones', label: 'Funciones', items: [
      { id: 'ia', label: 'IA de AKIRA', icon: Zap },
      { id: 'conexiones', label: 'Conexiones', icon: Plug },
      { id: 'mcp', label: 'MCP de AKIRA', icon: Plug },
      { id: 'sin-conexion', label: 'Sin conexión', icon: Wifi },
    ]},
  ]

  const allTabs = tabs.flatMap(section => section.items)
  const currentTabData = allTabs.find(t => t.id === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-1)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          width: '90vw',
          maxWidth: '1200px',
          height: '85vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-1)',
            margin: 0,
          }}>
            Configuración
          </h1>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--dur-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}>
          {/* Sidebar */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--border)',
            overflow: 'auto',
            padding: '16px 8px',
            flexShrink: 0,
          }}>
            {tabs.map((section) => (
              <div key={section.id} style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-3)',
                  padding: '0 12px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {section.label}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: isActive ? 'var(--brand)' : 'transparent',
                        color: isActive ? 'white' : 'var(--text-2)',
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        transition: 'all var(--dur-fast)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--bg-2)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <Icon size={16} style={{ flexShrink: 0 }} />
                      {item.label}
                    </motion.button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'mi-perfil' && (
                <div>
                  <h2 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: '16px',
                  }}>
                    Información personal
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-3)',
                    marginBottom: '24px',
                  }}>
                    Tu nombre, foto e información de contacto visible en AKIRA
                  </p>

                  {/* Avatar Section */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '32px',
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      background: 'var(--brand)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '32px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      T
                    </div>
                    <button style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-2)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all var(--dur-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Subir foto
                    </button>
                  </div>

                  {/* Form Fields */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        defaultValue="test@akira.local"
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-3)',
                        marginTop: '6px',
                      }}>
                        Puedes cambiarlo cuando quieras (recomendado: no más de una vez cada 30 días)
                      </p>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Empresa
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre de tu empresa"
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Rol / Cargo
                      </label>
                      <input
                        type="text"
                        defaultValue="owner"
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Teléfono
                      </label>
                      <input
                        type="text"
                        defaultValue="+34 600 000 000"
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Sitio web
                      </label>
                      <input
                        type="text"
                        defaultValue="https://tuwebsite.com"
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Ubicación
                      </label>
                      <input
                        type="text"
                        defaultValue="Madrid, España"
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-2)',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}>
                        Bio
                      </label>
                      <textarea
                        defaultValue="Cuéntanos sobre ti..."
                        style={{
                          width: '100%',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-1)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          minHeight: '100px',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-3)',
                        marginTop: '6px',
                      }}>
                        Una descripción breve sobre ti o tu negocio
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div style={{
                    marginTop: '32px',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                  }}>
                    <button
                      onClick={onClose}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-2)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'all var(--dur-fast)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      Cancelar
                    </button>
                    <button style={{
                      background: 'var(--brand)',
                      border: 'none',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all var(--dur-fast)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              )}

              {activeTab !== 'mi-perfil' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--text-3)',
                  fontSize: '14px',
                }}>
                  Esta sección está en desarrollo
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
