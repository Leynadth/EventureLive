const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseUrl = `${API_URL}/api`;


export function getImageBase() {
  if (typeof import.meta.env.VITE_API_URL === "string" && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "http://localhost:5000";
}


export function getImageUrl(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const base = getImageBase();
  return `${base}${trimmed.startsWith("/") ? trimmed : "/" + trimmed}`;
}


const TOKEN_KEY = "eventure_token";

function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getFetchOptions(customOptions = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...customOptions.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return {
    ...customOptions,
    headers,
  };
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(text || `Server error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

export async function login(email, password) {
  try {
    const emailNormalized = normalizeEmail(email);
    const response = await fetch(`${baseUrl}/auth/login`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({ email: emailNormalized, password }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function register({ firstName, lastName, email, password }) {
  try {
    const emailNormalized = normalizeEmail(email);
    const body = { firstName, lastName, email: emailNormalized, password };

    const response = await fetch(`${baseUrl}/auth/register`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify(body),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getMyOrganizerSignup() {
  try {
    const response = await fetch(`${baseUrl}/organizer-signup/me`, getFetchOptions());
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getNotifications() {
  try {
    const response = await fetch(`${baseUrl}/notifications`, getFetchOptions());
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function dismissSignupNotification(signupId) {
  try {
    const response = await fetch(`${baseUrl}/notifications/dismiss-signup/${signupId}`, {
      ...getFetchOptions(),
      method: "POST",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const response = await fetch(`${baseUrl}/notifications/${notificationId}/read`, {
      ...getFetchOptions(),
      method: "PATCH",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function markNotificationsViewed() {
  try {
    const response = await fetch(`${baseUrl}/notifications/mark-viewed`, {
      ...getFetchOptions(),
      method: "POST",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function clearNotifications() {
  try {
    const response = await fetch(`${baseUrl}/notifications`, {
      ...getFetchOptions(),
      method: "DELETE",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function notifyAttendees(eventId, message) {
  try {
    const response = await fetch(`${baseUrl}/events/${eventId}/notify-attendees`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getEventAnnouncements(eventId) {
  try {
    const response = await fetch(`${baseUrl}/events/${eventId}/announcements`, { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Failed to load announcements" }));
      throw new Error(err.message || "Failed to load announcements");
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function sendEventAnnouncement(eventId, message) {
  try {
    const response = await fetch(`${baseUrl}/events/${eventId}/announcements`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function deleteEventAnnouncement(eventId, announcementId) {
  try {
    const response = await fetch(`${baseUrl}/events/${eventId}/announcements/${announcementId}`, {
      ...getFetchOptions(),
      method: "DELETE",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function submitOrganizerSignup({ organizationName, eventTypes, reason, additionalInfo }) {
  try {
    const response = await fetch(`${baseUrl}/organizer-signup`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({
        organizationName: organizationName || null,
        eventTypes: eventTypes || null,
        reason: reason || "",
        additionalInfo: additionalInfo || null,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getOrganizerSignups() {
  try {
    const response = await fetch(`${baseUrl}/admin/organizer-signups`, getFetchOptions());
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function updateOrganizerSignup(id, action) {
  try {
    const response = await fetch(`${baseUrl}/admin/organizer-signups/${id}`, {
      ...getFetchOptions(),
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function logout() {
  try {
    const response = await fetch(`${baseUrl}/auth/logout`, {
      ...getFetchOptions(),
      method: "POST",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function forgotPassword(email) {
  try {
    const emailNormalized = normalizeEmail(email);
    const response = await fetch(`${baseUrl}/auth/forgot-password`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({ email: emailNormalized }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function resetPasswordWithCode(email, code, newPassword) {
  try {
    const emailNormalized = normalizeEmail(email);
    const response = await fetch(`${baseUrl}/auth/reset-password-with-code`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({
        email: emailNormalized,
        code: String(code),
        newPassword,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function verifyResetCode({ email, code }) {
  try {
    const emailNormalized = normalizeEmail(email);
    const response = await fetch(`${baseUrl}/auth/verify-reset-code`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({
        email: emailNormalized,
        code: String(code),
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getProfile() {
  try {
    const response = await fetch(`${baseUrl}/auth/profile`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function requestChangePasswordCode() {
  try {
    const response = await fetch(`${baseUrl}/auth/change-password-request`, {
      ...getFetchOptions(),
      method: "POST",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function changePassword(code, newPassword) {
  try {
    const response = await fetch(`${baseUrl}/auth/change-password`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({
        code: String(code),
        newPassword,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function requestDeleteAccountCode() {
  try {
    const response = await fetch(`${baseUrl}/auth/delete-account-request`, {
      ...getFetchOptions(),
      method: "POST",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function deleteAccount(code) {
  try {
    const response = await fetch(`${baseUrl}/auth/delete-account`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({
        code: String(code),
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getCategories() {
  try {
    const response = await fetch(`${baseUrl}/events/categories`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function resetPassword({ email, code, newPassword }) {
  try {
    const emailNormalized = normalizeEmail(email);
    const response = await fetch(`${baseUrl}/auth/reset-password`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify({
        email: emailNormalized,
        code: String(code),
        newPassword,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

function toQueryString(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    usp.set(key, String(value));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}


export async function getEvents(params) {
  try {
    const response = await fetch(`${baseUrl}/events${toQueryString(params)}`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getEventById(id) {
  try {
    const response = await fetch(`${baseUrl}/events/${id}`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getLocationFromCoords(lat, lng) {
  const response = await fetch(
    `${baseUrl}/events/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    { ...getFetchOptions(), method: "GET" }
  );
  return await handleResponse(response);
}


export async function getFavorites() {
  try {
    const response = await fetch(`${baseUrl}/favorites`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function addFavorite(eventId) {
  try {
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      throw new Error("Invalid event ID");
    }
    
    const response = await fetch(`${baseUrl}/favorites/${eventIdNum}`, {
      ...getFetchOptions(),
      method: "POST",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function removeFavorite(eventId) {
  try {
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      throw new Error("Invalid event ID");
    }
    
    const response = await fetch(`${baseUrl}/favorites/${eventIdNum}`, {
      ...getFetchOptions(),
      method: "DELETE",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function checkFavorite(eventId) {
  try {
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      throw new Error("Invalid event ID");
    }
    
    const response = await fetch(`${baseUrl}/favorites/check/${eventIdNum}`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function clearAllFavorites() {
  try {
    const response = await fetch(`${baseUrl}/favorites`, {
      ...getFetchOptions(),
      method: "DELETE",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getMyEvents() {
  try {
    const response = await fetch(`${baseUrl}/events/my`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getMyPastEvents() {
  try {
    const response = await fetch(`${baseUrl}/events/my/past`, {
      ...getFetchOptions(),
      method: "GET",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getAttendingEvents() {
  try {
    const response = await fetch(`${baseUrl}/events/attending`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getOrganizerEventAnalytics(eventId) {
  const id = parseInt(eventId, 10);
  if (isNaN(id)) throw new Error("Invalid event ID");
  const response = await fetch(`${baseUrl}/events/${id}/organizer-analytics`, {
    ...getFetchOptions(),
    method: "GET",
  });
  return await handleResponse(response);
}


export async function deleteEvent(eventId) {
  try {
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      throw new Error("Invalid event ID");
    }
    
    const response = await fetch(`${baseUrl}/events/${eventIdNum}`, {
      ...getFetchOptions(),
      method: "DELETE",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function uploadEventImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/upload/event-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function createEvent(eventData) {
  try {
    const response = await fetch(`${baseUrl}/events`, {
      ...getFetchOptions(),
      method: "POST",
      body: JSON.stringify(eventData),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function updateEvent(eventId, eventData) {
  try {
    const response = await fetch(`${baseUrl}/events/${eventId}`, {
      ...getFetchOptions(),
      method: "PUT",
      body: JSON.stringify(eventData),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function rsvpToEvent(eventId) {
  try {
    const response = await fetch(`${baseUrl}/rsvp/${eventId}`, {
      ...getFetchOptions(),
      method: "POST",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function cancelRSVP(eventId) {
  try {
    const response = await fetch(`${baseUrl}/rsvp/${eventId}`, {
      ...getFetchOptions(),
      method: "DELETE",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function checkRSVPStatus(eventId) {
  try {
    const response = await fetch(`${baseUrl}/rsvp/${eventId}`, {
      ...getFetchOptions(),
      method: "GET",
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getEventReviews(eventId) {
  const response = await fetch(`${baseUrl}/events/${eventId}/reviews`, { ...getFetchOptions(), method: "GET" });
  return handleResponse(response);
}

export async function postEventReview(eventId, { rating, comment, photoUrl }) {
  const response = await fetch(`${baseUrl}/events/${eventId}/reviews`, {
    ...getFetchOptions(),
    method: "POST",
    body: JSON.stringify({ rating, comment, photoUrl }),
  });
  return handleResponse(response);
}


export async function getEventDiscussion(eventId) {
  const response = await fetch(`${baseUrl}/events/${eventId}/discussion`, { ...getFetchOptions(), method: "GET" });
  return handleResponse(response);
}

export async function postEventDiscussion(eventId, message) {
  const response = await fetch(`${baseUrl}/events/${eventId}/discussion`, {
    ...getFetchOptions(),
    method: "POST",
    body: JSON.stringify({ message }),
  });
  return handleResponse(response);
}


export async function followOrganizer(organizerId) {
  const response = await fetch(`${baseUrl}/follows/${organizerId}`, { ...getFetchOptions(), method: "POST" });
  return handleResponse(response);
}

export async function unfollowOrganizer(organizerId) {
  const response = await fetch(`${baseUrl}/follows/${organizerId}`, { ...getFetchOptions(), method: "DELETE" });
  return handleResponse(response);
}

export async function checkFollowStatus(organizerId) {
  const response = await fetch(`${baseUrl}/follows/check/${organizerId}`, { ...getFetchOptions(), method: "GET" });
  return handleResponse(response);
}

export async function getMyFollowing() {
  const response = await fetch(`${baseUrl}/follows/me`, { ...getFetchOptions(), method: "GET" });
  return handleResponse(response);
}


export async function getAdminStats() {
  try {
    const response = await fetch(`${baseUrl}/admin/stats`, {
      ...getFetchOptions(),
      method: "GET",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(errorData.message || `Failed to fetch stats: ${response.status}`);
    }
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getAllEvents() {
  try {
    const response = await fetch(`${baseUrl}/admin/events`, {
      ...getFetchOptions(),
      method: "GET",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(errorData.message || `Failed to fetch events: ${response.status}`);
    }
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getAdminEventDetails(eventId) {
  const response = await fetch(`${baseUrl}/admin/events/${eventId}`, {
    ...getFetchOptions(),
    method: "GET",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Failed to load event" }));
    throw new Error(err.message || "Failed to load event details");
  }
  return await response.json();
}


export async function adminDeleteEvent(eventId) {
  try {
    const response = await fetch(`${baseUrl}/admin/events/${eventId}`, {
      ...getFetchOptions(),
      method: "DELETE",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getAllUsers() {
  try {
    const response = await fetch(`${baseUrl}/admin/users`, {
      ...getFetchOptions(),
      method: "GET",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getUserDetails(userId) {
  try {
    const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
      ...getFetchOptions(),
      method: "GET",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function updateUserRole(userId, role) {
  try {
    const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
      ...getFetchOptions(),
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    const response = await fetch(`${baseUrl}/admin/users/${userId}`, {
      ...getFetchOptions(),
      method: "DELETE",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function unattendUserFromEvent(userId, eventId, reason) {
  try {
    const response = await fetch(`${baseUrl}/admin/users/${userId}/unattend/${eventId}`, {
      ...getFetchOptions(),
      method: "DELETE",
      body: JSON.stringify({ reason: String(reason || "").trim() }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function getAnalytics() {
  try {
    const response = await fetch(`${baseUrl}/admin/analytics`, {
      ...getFetchOptions(),
      method: "GET",
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getHeroSettings() {
  try {
    const response = await fetch(`${baseUrl}/admin/settings/hero`, getFetchOptions());
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function updateHeroSettings({ type, color, image }) {
  try {
    const response = await fetch(`${baseUrl}/admin/settings/hero`, {
      ...getFetchOptions(),
      method: "PUT",
      body: JSON.stringify({ type, color, image }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function uploadHeroImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/upload/hero-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function uploadFoundersImage(imageFile) {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${baseUrl}/upload/founders-image`, {
      method: "POST",
      headers,
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export async function getContentSettings() {
  const response = await fetch(`${baseUrl}/admin/settings/content`, { ...getFetchOptions(), method: "GET" });
  return handleResponse(response);
}

export async function updateContentSettings(payload) {
  const response = await fetch(`${baseUrl}/admin/settings/content`, {
    ...getFetchOptions(),
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}


export async function getAdminCategories() {
  const response = await fetch(`${baseUrl}/admin/categories`, { ...getFetchOptions(), method: "GET" });
  return handleResponse(response);
}

export async function addAdminCategory(name) {
  const response = await fetch(`${baseUrl}/admin/categories`, {
    ...getFetchOptions(),
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function updateAdminCategory(id, name) {
  const response = await fetch(`${baseUrl}/admin/categories/${id}`, {
    ...getFetchOptions(),
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  return handleResponse(response);
}

export async function deleteAdminCategory(id) {
  const response = await fetch(`${baseUrl}/admin/categories/${id}`, { ...getFetchOptions(), method: "DELETE" });
  return handleResponse(response);
}


export async function backfillEventCoordinates() {
  const response = await fetch(`${baseUrl}/admin/events/backfill-coordinates`, {
    ...getFetchOptions(),
    method: "POST",
  });
  return handleResponse(response);
}


export async function updateProfileSettings({ showContactInfo }) {
  try {
    const response = await fetch(`${baseUrl}/auth/profile`, {
      ...getFetchOptions(),
      method: "PUT",
      body: JSON.stringify({ showContactInfo }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}

export async function uploadProfilePicture(imageFile) {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/upload/profile-picture`, {
      method: "POST",
      headers,
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Unable to connect to server. Please check if the server is running.");
    }
    throw error;
  }
}


export { getFetchOptions };