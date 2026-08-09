export function readJson(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

export function writeJson(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeJson(key) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(key)
}

export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}