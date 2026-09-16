export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Algo não saiu como esperado.')
  return body as T
}
