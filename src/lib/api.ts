export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  const isJson = response.headers.get('content-type')?.includes('application/json')
  if (!isJson) throw new Error('Não foi possível conectar ao serviço. Tente novamente mais tarde.')
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Não foi possível conectar ao serviço. Tente novamente mais tarde.')
  return body as T
}
