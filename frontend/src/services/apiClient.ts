import { environment } from '../shared/config/environment';

interface ApiClientOptions extends RequestInit {
  accessToken?: string | null;
}

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const { accessToken, headers, ...requestOptions } = options;
  const response = await fetch(`${environment.apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}
