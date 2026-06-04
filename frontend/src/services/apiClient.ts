import { environment } from '../shared/config/environment';

interface ApiClientOptions extends RequestInit {
  accessToken?: string | null;
}

interface ApiErrorResponse {
  message?: string | string[];
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly messages: string[],
  ) {
    super(messages.join(' '));
    this.name = 'ApiClientError';
  }
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiClientError && error.messages.length > 0) {
    return error.messages.join(' ');
  }

  return fallbackMessage;
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
    let messages = [`API request failed with status ${response.status}`];

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;

      if (Array.isArray(errorBody.message)) {
        messages = errorBody.message;
      } else if (errorBody.message) {
        messages = [errorBody.message];
      }
    } catch {
      // Keep the default technical message when the API does not return JSON.
    }

    throw new ApiClientError(response.status, messages);
  }

  return (await response.json()) as TResponse;
}
