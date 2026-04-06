const AUTH_KEYS = ["token", "userRole", "userId", "userName", "profilePhoto"]

function hasWindow() {
  return typeof window !== "undefined"
}

export function getSessionItem(key) {
  if (!hasWindow()) return ""
  return window.sessionStorage.getItem(key) || ""
}

export function setSessionItem(key, value) {
  if (!hasWindow()) return

  if (value == null || value === "") {
    window.sessionStorage.removeItem(key)
    return
  }

  window.sessionStorage.setItem(key, String(value))
}

export function setAuthSession({ token, userRole, userId, userName, profilePhoto }) {
  if (!hasWindow()) return

  clearAuthSession()

  setSessionItem("token", token)
  setSessionItem("userRole", userRole)
  setSessionItem("userId", userId)
  setSessionItem("userName", userName)
  setSessionItem("profilePhoto", profilePhoto)
}

export function updateProfileSession({ userRole, userName, profilePhoto }) {
  if (!hasWindow()) return

  if (userRole !== undefined) setSessionItem("userRole", userRole)
  if (userName !== undefined) setSessionItem("userName", userName)
  if (profilePhoto !== undefined) setSessionItem("profilePhoto", profilePhoto)
}

export function clearAuthSession() {
  if (!hasWindow()) return

  for (const key of AUTH_KEYS) {
    window.sessionStorage.removeItem(key)
    window.localStorage.removeItem(key)
  }
}

export function getAuthToken() {
  return getSessionItem("token")
}
