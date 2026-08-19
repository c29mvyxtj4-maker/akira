import clsx from 'clsx'

const ARIA_LABELS = {
  archive: 'Archivar',
  delete: 'Eliminar',
  edit: 'Editar',
  close: 'Cerrar',
  menu: 'Más opciones',
  add: 'Agregar',
  download: 'Descargar',
  share: 'Compartir',
  search: 'Buscar',
  filter: 'Filtrar',
  settings: 'Configuración',
  info: 'Información',
  help: 'Ayuda',
  copy: 'Copiar',
  expand: 'Expandir',
  collapse: 'Contraer',
}

export default function IconButton({
  icon: Icon,
  onClick,
  ariaLabel,
  type = 'button',
  className = '',
  title,
  children,
  ...props
}) {
  // Auto-detect aria-label from icon name if not provided
  let finalAriaLabel = ariaLabel || title

  if (!finalAriaLabel && Icon) {
    const iconName = Icon.displayName || Icon.name || ''
    const key = iconName.toLowerCase().replace(/icon/gi, '')
    finalAriaLabel = ARIA_LABELS[key] || key
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={finalAriaLabel}
      title={title || finalAriaLabel}
      className={clsx(
        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
        'hover:bg-surface-4 text-text-3 hover:text-text-1',
        className
      )}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}
