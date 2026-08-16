import React, { Suspense } from 'react'
import { WidgetProps } from '../types'
import { widgetRegistry } from '../WidgetRegistry'
import Spinner from '@/shared/components/ui/Spinner'

export const Widget: React.FC<WidgetProps & { config: any }> = ({
  config,
  data,
  loading = false,
  error,
  onUpdate,
  onRemove,
}) => {
  const definition = widgetRegistry.get(config.type)

  if (!definition) {
    return (
      <div className="bg-surface-1 rounded-lg p-4 border border-surface-2">
        <p className="text-text-3 text-sm">Widget type not found: {config.type}</p>
      </div>
    )
  }

  const Component = definition.component

  const sizeClasses = {
    sm: 'col-span-1',
    md: 'col-span-2',
    lg: 'col-span-3',
    full: 'col-span-4',
  }

  return (
    <div className={`${sizeClasses[config.size || 'md']} rounded-lg overflow-hidden`}>
      <div className="bg-surface-0 border border-surface-2 rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-2">
          <h3 className="font-semibold text-text-1 text-sm">{config.title}</h3>
          <div className="flex gap-2">
            {onRemove && (
              <button
                onClick={() => onRemove(config.id)}
                className="p-1 hover:bg-surface-1 rounded text-text-3 hover:text-text-2 transition-colors"
                title="Remove widget"
              >
                âœ•
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
          ) : error ? (
            <div className="bg-danger/10 border border-danger/20 rounded p-3">
              <p className="text-danger text-xs">{error}</p>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-32">
                  <Spinner />
                </div>
              }
            >
              <Component
                config={config}
                data={data}
                loading={loading}
                error={error}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

export default Widget

