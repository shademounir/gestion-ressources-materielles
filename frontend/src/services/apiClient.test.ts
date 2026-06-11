import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, apiClient, getApiErrorMessage } from './apiClient';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls the API with JSON and authorization headers', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));

    const response = await apiClient<{ ok: boolean }>('/resources', {
      accessToken: 'access-token',
      method: 'POST',
      body: JSON.stringify({ name: 'Resource' }),
    });

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resources',
      expect.objectContaining({
        body: JSON.stringify({ name: 'Resource' }),
        method: 'POST',
      }),
    );
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers).toMatchObject({
      Authorization: 'Bearer access-token',
      'Content-Type': 'application/json',
    });
  });

  it('exposes API validation messages from array responses', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          message: [
            'inventoryCode must be longer than or equal to 2 characters',
            'inventoryCode must be a string',
          ],
        },
        400,
      ),
    );

    await expect(apiClient('/resources')).rejects.toMatchObject({
      messages: [
        'inventoryCode must be longer than or equal to 2 characters',
        'inventoryCode must be a string',
      ],
      status: 400,
    });
  });

  it('exposes API validation messages from string responses', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'Une ressource avec cette reference inventaire existe deja.' }, 409),
    );

    await expect(apiClient('/resources')).rejects.toMatchObject({
      messages: ['Une ressource avec cette reference inventaire existe deja.'],
      status: 409,
    });
  });

  it('keeps a fallback message when the API error body is not JSON', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Unavailable', { status: 503 }));

    await expect(apiClient('/resources')).rejects.toMatchObject({
      messages: ['API request failed with status 503'],
      status: 503,
    });
  });

  it('formats known API errors and keeps fallback text for unknown errors', () => {
    expect(
      getApiErrorMessage(new ApiClientError(400, ['Champ obligatoire', 'Valeur invalide']), 'Fallback'),
    ).toBe('Champ obligatoire Valeur invalide');
    expect(getApiErrorMessage(new Error('Network error'), 'Fallback')).toBe('Fallback');
  });
});
