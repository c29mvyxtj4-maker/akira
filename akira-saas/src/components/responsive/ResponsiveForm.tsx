import { ReactNode, CSSProperties } from 'react'
import { useResponsive } from '@/hooks/useResponsive'
import { motion } from 'framer-motion'

/**
 * ResponsiveForm - Contenedor de formulario responsivo
 * Ajusta layout, spacing, y tamaños de campos según breakpoint
 */

interface ResponsiveFormProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  columns?: number
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ResponsiveForm({
  children,
  onSubmit,
  columns = 2,
  gap = 'md',
  className = '',
}: ResponsiveFormProps) {
  const { isMobile, isTablet } = useResponsive()

  // Determine column count based on breakpoint
  const actualColumns = isMobile ? 1 : isTablet ? 1 : columns

  const gapMap = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`responsive-form ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${actualColumns}, 1fr)`,
        gap: gapMap[gap],
      }}
    >
      {children}
    </form>
  )
}

/**
 * FormField - Campo de formulario responsive
 * Wrapper para input, textarea, select con etiqueta
 */

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  hint?: string
  span?: number // Cuantas columnas ocupa (para layouts multi-columna)
}

export function FormField({
  label,
  error,
  required,
  children,
  hint,
  span = 1,
}: FormFieldProps) {
  const { isMobile } = useResponsive()

  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <label
        style={{
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 600,
          color: 'var(--text-1)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {children}
      </div>

      {hint && !error && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-3)',
            margin: 0,
          }}
        >
          {hint}
        </p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '12px',
            color: 'var(--danger)',
            margin: 0,
          }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

/**
 * FormInput - Input responsivo
 * Font-size mínimo 16px en móvil para evitar zoom iOS
 */

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function FormInput({ error, ...props }: FormInputProps) {
  const { isMobile } = useResponsive()

  return (
    <input
      {...props}
      style={{
        padding: isMobile ? '12px 14px' : '10px 12px',
        borderRadius: '6px',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--surface-2)'}`,
        backgroundColor: 'var(--surface-0)',
        color: 'var(--text-1)',
        fontSize: isMobile ? '16px' : '14px', // 16px to prevent iOS zoom
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none',
        minHeight: isMobile ? '44px' : 'auto',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--brand)'
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(230, 57, 70, 0.1)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--surface-2)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

/**
 * FormTextarea - Textarea responsivo
 */

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function FormTextarea({ error, ...props }: FormTextareaProps) {
  const { isMobile } = useResponsive()

  return (
    <textarea
      {...props}
      style={{
        padding: isMobile ? '12px 14px' : '10px 12px',
        borderRadius: '6px',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--surface-2)'}`,
        backgroundColor: 'var(--surface-0)',
        color: 'var(--text-1)',
        fontSize: isMobile ? '16px' : '14px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none',
        minHeight: isMobile ? '120px' : '100px',
        resize: 'vertical',
        ...props.style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--brand)'
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(230, 57, 70, 0.1)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--surface-2)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

/**
 * FormSelect - Select responsivo
 */

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function FormSelect({
  error,
  options,
  placeholder,
  ...props
}: FormSelectProps) {
  const { isMobile } = useResponsive()

  return (
    <select
      {...props}
      style={{
        padding: isMobile ? '12px 14px' : '10px 12px',
        borderRadius: '6px',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--surface-2)'}`,
        backgroundColor: 'var(--surface-0)',
        color: 'var(--text-1)',
        fontSize: isMobile ? '16px' : '14px',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none',
        minHeight: isMobile ? '44px' : 'auto',
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

/**
 * FormCheckbox - Checkbox con label inline responsivo
 */

interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: boolean
}

export function FormCheckbox({ label, error, ...props }: FormCheckboxProps) {
  const { isMobile } = useResponsive()

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--surface-1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <input
        type="checkbox"
        {...props}
        style={{
          width: isMobile ? '20px' : '18px',
          height: isMobile ? '20px' : '18px',
          cursor: 'pointer',
          accentColor: 'var(--brand)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: isMobile ? '14px' : '13px',
          color: error ? 'var(--danger)' : 'var(--text-1)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </label>
  )
}

/**
 * FormGroup - Grupo de campos lado a lado (desktop) / apilados (móvil)
 */

interface FormGroupProps {
  children: ReactNode
  label?: string
  columns?: number
}

export function FormGroup({
  children,
  label,
  columns = 2,
}: FormGroupProps) {
  const { isMobile } = useResponsive()

  return (
    <fieldset
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `repeat(${columns}, 1fr)`,
        gap: '16px',
      }}
    >
      {label && (
        <legend
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-1)',
            marginBottom: '8px',
            gridColumn: '1 / -1',
          }}
        >
          {label}
        </legend>
      )}
      {children}
    </fieldset>
  )
}

/**
 * FormActions - Botones de acciones del formulario (Submit, Cancel, etc)
 */

interface FormActionsProps {
  children: ReactNode
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  reversed?: boolean
}

export function FormActions({
  children,
  gap = 'md',
  reversed = false,
}: FormActionsProps) {
  const { isMobile } = useResponsive()

  const gapMap = {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : reversed ? 'row-reverse' : 'row',
        gap: gapMap[gap],
        justifyContent: isMobile ? 'stretch' : 'flex-end',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid var(--surface-2)',
      }}
    >
      {children}
    </div>
  )
}
