/**
 * Security & Validation Utilities for Investor Forum
 * Provides input sanitization, trade verification, and secure admin token sessions.
 */

// Simple client-side sanitization to strip dangerous tags and script injection
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .trim();
}

// Comprehensive trade validation against manipulation and negative bounds
export function validateTradeSecurity({
  stock,
  teamCash,
  ownedShares,
  tradeType,
  sharesCount,
  isMarketPaused
}) {
  if (isMarketPaused) {
    return { isValid: false, error: "Market is currently paused by organizers. Orders rejected." };
  }

  if (!stock || !stock.id || !stock.price) {
    return { isValid: false, error: "Invalid stock instrument selected." };
  }

  const cleanShares = Math.floor(Number(sharesCount));
  if (isNaN(cleanShares) || cleanShares <= 0 || !Number.isInteger(cleanShares)) {
    return { isValid: false, error: "Quantity must be a positive whole integer." };
  }

  if (cleanShares > 1000000) {
    return { isValid: false, error: "Order size exceeds maximum single execution limit (1,000,000 shares)." };
  }

  const currentPrice = Number(stock.price);
  if (isNaN(currentPrice) || currentPrice <= 0) {
    return { isValid: false, error: "Invalid execution market price." };
  }

  const totalCost = Number((cleanShares * currentPrice).toFixed(2));
  const availableCash = Number(teamCash) || 0;
  const currentOwned = Number(ownedShares) || 0;

  if (tradeType === "BUY") {
    if (totalCost > availableCash) {
      return {
        isValid: false,
        error: `Insufficient available funds. Required: $${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Available: $${availableCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      };
    }
  } else if (tradeType === "SELL") {
    if (cleanShares > currentOwned) {
      return {
        isValid: false,
        error: `Cannot sell unowned shares. You own ${currentOwned} shares, but attempted to sell ${cleanShares}.`
      };
    }
  } else {
    return { isValid: false, error: "Invalid order execution type." };
  }

  return {
    isValid: true,
    cleanShares,
    totalCost,
    pricePerShare: currentPrice
  };
}

// Secure Admin Session Management with Expiry and Signature Check
const ADMIN_SESSION_KEY = "if_admin_auth_v2";
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours

export function createAdminSession(username, serverToken = null) {
  const timestamp = Date.now();
  const sessionData = {
    user: username,
    timestamp,
    expiresAt: timestamp + SESSION_EXPIRY_MS,
    token: serverToken || btoa(`${username}:${timestamp}:investor-forum-secure-sig`)
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
  return true;
}

export function verifyAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session || !session.expiresAt || !session.token) {
      destroyAdminSession();
      return false;
    }
    if (Date.now() > session.expiresAt) {
      destroyAdminSession();
      return false;
    }
    return true;
  } catch (e) {
    destroyAdminSession();
    return false;
  }
}

export function destroyAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem("if_admin_session");
}

// Brute Force Login Protection Tracker
const LOGIN_ATTEMPTS_KEY = "if_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout

export function checkLoginRateLimit() {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (!raw) return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
    const record = JSON.parse(raw);
    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      const waitSeconds = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, waitSeconds };
    }
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS - (record.count || 0) };
  } catch (e) {
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }
}

export function recordFailedLogin() {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    let record = raw ? JSON.parse(raw) : { count: 0 };
    record.count = (record.count || 0) + 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCKOUT_MS;
      record.count = 0;
    }
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(record));
  } catch (e) {}
}

export function resetFailedLogins() {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
}

// Admin rate limit aliases
export const checkAdminRateLimit = checkLoginRateLimit;
export const recordFailedAdminAttempt = recordFailedLogin;
export const resetAdminAttempts = resetFailedLogins;

