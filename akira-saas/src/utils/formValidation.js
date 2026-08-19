export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} es requerido`
  }
  return null
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) {
    return 'Correo inválido'
  }
  return null
}

export function validatePrice(price) {
  const num = Number(price)
  if (isNaN(num) || num < 0) {
    return 'Precio debe ser mayor a 0'
  }
  return null
}

export function validateForm(data, rules) {
  const errors = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    if (rule.required) {
      const err = validateRequired(value, rule.label || field)
      if (err) errors[field] = err
      continue
    }

    if (rule.type === 'email' && value) {
      const err = validateEmail(value)
      if (err) errors[field] = err
    }

    if (rule.type === 'number' && value) {
      const err = validatePrice(value)
      if (err) errors[field] = err
    }

    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Mínimo ${rule.minLength} caracteres`
    }

    if (rule.custom && value) {
      const err = rule.custom(value)
      if (err) errors[field] = err
    }
  }

  return errors
}
