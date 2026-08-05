let accessToken = null;

const listeners = new Set();

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emitAuthChange() {
  listeners.forEach((cb) => cb());
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, { method = "GET", body, auth = true, retried = false } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch(path, { method, body, auth, retried: true });
    }
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || "Erreur serveur", res.status);
  }
  return data;
}

export async function getSiteContent() {
  return apiFetch("/content", { auth: false });
}

// ===== RGPD : consentement, contact, newsletter =====
export const consentApi = {
  save: (data) => apiFetch("/consents", { method: "POST", body: data, auth: false }),
  get: (email) => apiFetch(`/consents/${encodeURIComponent(email)}`, { auth: false }),
};

export const contactApi = {
  send: (data) => apiFetch("/contact", { method: "POST", body: data, auth: false }),
  access: (email) => apiFetch(`/contact/access/${encodeURIComponent(email)}`, { auth: false }),
  erase: (email) => apiFetch(`/contact/erase/${encodeURIComponent(email)}`, { method: "DELETE", auth: false }),
};

export const newsletterApi = {
  subscribe: (data) => apiFetch("/newsletter", { method: "POST", body: data, auth: false }),
  check: (email) => apiFetch(`/newsletter/check/${encodeURIComponent(email)}`, { auth: false }),
  unsubscribe: (email) =>
    apiFetch(`/newsletter/unsubscribe/${encodeURIComponent(email)}`, { method: "DELETE", auth: false }),
};

export async function getContentAdmin() {
  return apiFetch("/content/admin");
}

export async function saveSection(name, data) {
  return apiFetch(`/content/admin/${name}`, { method: "PUT", body: { data } });
}

export async function getBlogAdmin() {
  return apiFetch("/content/admin/blog");
}

export async function createBlogPost(post) {
  return apiFetch("/content/admin/blog", { method: "POST", body: post });
}

export async function updateBlogPost(id, post) {
  return apiFetch(`/content/admin/blog/${id}`, { method: "PUT", body: post });
}

export async function deleteBlogPost(id) {
  return apiFetch(`/content/admin/blog/${id}`, { method: "DELETE" });
}

// ===== Formations =====
export const getTrainings = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`/trainings${qs ? `?${qs}` : ""}`, { auth: false });
};
export const createTrainingRegistration = (data) =>
  apiFetch("/trainings/registrations", { method: "POST", body: data, auth: false });
export const getTrainingsAdmin = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`/trainings/admin${qs ? `?${qs}` : ""}`);
};
export const createTraining = (data) => apiFetch("/trainings/admin", { method: "POST", body: data });
export const updateTraining = (id, data) =>
  apiFetch(`/trainings/admin/${id}`, { method: "PUT", body: data });
export const deleteTraining = (id) => apiFetch(`/trainings/admin/${id}`, { method: "DELETE" });
export const getTrainingRegistrationsAdmin = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`/trainings/admin/registrations${qs ? `?${qs}` : ""}`);
};
export const updateTrainingRegistration = (id, data) =>
  apiFetch(`/trainings/admin/registrations/${id}`, { method: "PUT", body: data });
export const deleteTrainingRegistration = (id) =>
  apiFetch(`/trainings/admin/registrations/${id}`, { method: "DELETE" });
// ===== Membres =====
export const getMembers = () => apiFetch("/members");
export const getMembersStats = () => apiFetch("/members/stats");
export const createMember = (member) => apiFetch("/members", { method: "POST", body: member });
export const updateMember = (id, member) =>
  apiFetch(`/members/${id}`, { method: "PUT", body: member });
export const deleteMember = (id) => apiFetch(`/members/${id}`, { method: "DELETE" });

// ===== Cotisations =====
export const getCotisations = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`/cotisations${qs ? `?${qs}` : ""}`);
};
export const getCotisationsStats = () => apiFetch("/cotisations/stats");
export const createCotisation = (data) =>
  apiFetch("/cotisations", { method: "POST", body: data });
export const updateCotisation = (id, data) =>
  apiFetch(`/cotisations/${id}`, { method: "PUT", body: data });
export const deleteCotisation = (id) =>
  apiFetch(`/cotisations/${id}`, { method: "DELETE" });

// ===== Documents (archivage) =====
export const getDocuments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`/documents${qs ? `?${qs}` : ""}`);
};
export const getDocumentsStats = () => apiFetch("/documents/stats");
export function deleteDocument(id) {
  return apiFetch(`/documents/${id}`, { method: "DELETE" });
}
export async function uploadDocument(formData) {
  const res = await fetch("/api/documents", {
    method: "POST",
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });
  if (res.status === 401 && accessToken) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return uploadDocument(formData);
    }
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.error || "Erreur lors de l'upload", res.status);
  }
  return res.json();
}

// ===== Projets / tâches / messages (collaboratif) =====
export const getProjects = () => apiFetch("/projects");
export const createProject = (data) => apiFetch("/projects", { method: "POST", body: data });
export const updateProject = (id, data) =>
  apiFetch(`/projects/${id}`, { method: "PUT", body: data });
export const deleteProject = (id) => apiFetch(`/projects/${id}`, { method: "DELETE" });
export const getTasks = (projectId) => apiFetch(`/projects/${projectId}/tasks`);
export const createTask = (projectId, data) =>
  apiFetch(`/projects/${projectId}/tasks`, { method: "POST", body: data });
export const updateTask = (taskId, data) =>
  apiFetch(`/projects/tasks/${taskId}`, { method: "PUT", body: data });
export const deleteTask = (taskId) =>
  apiFetch(`/projects/tasks/${taskId}`, { method: "DELETE" });
export const getMessages = (projectId) => apiFetch(`/projects/${projectId}/messages`);
export const createMessage = (projectId, body) =>
  apiFetch(`/projects/${projectId}/messages`, { method: "POST", body: { body } });
export const deleteMessage = (messageId) =>
  apiFetch(`/projects/messages/${messageId}`, { method: "DELETE" });

// ===== Factures =====
export const getInvoices = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return apiFetch(`/invoices${qs ? `?${qs}` : ""}`);
};
export const getInvoicesStats = () => apiFetch("/invoices/stats");
export const createInvoice = (data) => apiFetch("/invoices", { method: "POST", body: data });
export const updateInvoice = (id, data) =>
  apiFetch(`/invoices/${id}`, { method: "PUT", body: data });
export const deleteInvoice = (id) => apiFetch(`/invoices/${id}`, { method: "DELETE" });

async function tryRefresh() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    setAccessToken(null);
    emitAuthChange();
    return false;
  }
  const data = await res.json();
  setAccessToken(data.accessToken);
  emitAuthChange();
  return true;
}


