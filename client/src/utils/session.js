// Session management utilities for human voters

export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getSessionToken() {
  let token = localStorage.getItem('stablelobster_session');
  if (!token) {
    token = generateSessionToken();
    localStorage.setItem('stablelobster_session', token);
  }
  return token;
}

export function clearSessionToken() {
  localStorage.removeItem('stablelobster_session');
}
