const USERS_KEY = 'safe-city-users'
const CURRENT_USER_KEY = 'safe-city-current-user'

const readStorage = (key) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const buildUser = (payload) => ({
  id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: payload.name?.trim() || '',
  email: payload.email?.toLowerCase().trim() || '',
  phone: payload.phone?.trim() || '',
  password: payload.password || '',
  address: payload.address?.trim() || '',
  bio: payload.bio?.trim() || 'Usuario de Safe City',
  photo: payload.photo || ''
})

export const getStoredUsers = () => {
  const users = readStorage(USERS_KEY)
  return Array.isArray(users) ? users : []
}

export const getCurrentUser = () => {
  const user = readStorage(CURRENT_USER_KEY)
  return user ? user : null
}

export const setCurrentUser = (user) => {
  const safeUser = buildUser(user)
  writeStorage(CURRENT_USER_KEY, safeUser)
  return safeUser
}

export const loginUser = (email, password) => {
  const users = getStoredUsers()
  const foundUser = users.find((user) => user.email === email.toLowerCase().trim() && user.password === password)

  if (!foundUser) {
    return null
  }

  return setCurrentUser(foundUser)
}

export const registerUser = (payload) => {
  const users = getStoredUsers()
  const normalizedEmail = payload.email?.toLowerCase().trim() || ''
  const existingUser = users.some((user) => user.email === normalizedEmail)

  if (existingUser) {
    return { ok: false, error: 'Ya existe una cuenta con ese correo.' }
  }

  const user = buildUser({ ...payload, email: normalizedEmail })
  users.push(user)
  writeStorage(USERS_KEY, users)
  setCurrentUser(user)

  return { ok: true, user }
}

export const updateCurrentUser = (payload) => {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    return null
  }

  const users = getStoredUsers()
  const index = users.findIndex((user) => user.id === currentUser.id)

  if (index === -1) {
    return setCurrentUser(payload)
  }

  const updatedUser = buildUser({ ...currentUser, ...payload, id: currentUser.id })
  users[index] = updatedUser
  writeStorage(USERS_KEY, users)
  return setCurrentUser(updatedUser)
}
