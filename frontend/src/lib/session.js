const STORAGE_KEY = 'liquid_session_v1';

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return getSession()?.token || '';
}

export function getWorkspaceId() {
  return getSession()?.workspace?.id || '';
}

