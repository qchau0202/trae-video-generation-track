import axios from 'axios';
import { getAuthToken, getWorkspaceId } from '../lib/session';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  const workspaceId = getWorkspaceId();
  const headers = { ...(config.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (workspaceId) headers['x-workspace-id'] = workspaceId;
  return { ...config, headers };
});

export const publicApi = axios.create({ baseURL });

