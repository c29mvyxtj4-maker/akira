import clsx from 'clsx'

export default function Divider({ label, className }) {
  if (label) {
    return (
      <div className={clsx('flex items-center gap-3', className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-2xs text-text-4 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    )
  }
  return <div className={clsx('h-px bg-border', className)} />
}