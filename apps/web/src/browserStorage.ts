export function readLocalStorageJSON<T>(
  key: string,
  fallbackValue: T,
  isValid?: (value: unknown) => value is T,
) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      return fallbackValue
    }

    const parsedValue: unknown = JSON.parse(storedValue)

    if (isValid && !isValid(parsedValue)) {
      return fallbackValue
    }

    return (parsedValue as T) ?? fallbackValue
  } catch {
    // Storage can be blocked (private mode, disabled site data) or hold invalid JSON.
    return fallbackValue
  }
}

export function writeLocalStorageJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key)
      return
    }

    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked; the app keeps working without persistence.
  }
}
