export function readLocalStorageJSON<T>(
  key: string,
  fallbackValue: T,
  isValid?: (value: unknown) => value is T,
) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  const storedValue = window.localStorage.getItem(key)

  if (!storedValue) {
    return fallbackValue
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)

    if (isValid && !isValid(parsedValue)) {
      return fallbackValue
    }

    return (parsedValue as T) ?? fallbackValue
  } catch {
    return fallbackValue
  }
}

export function writeLocalStorageJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}
