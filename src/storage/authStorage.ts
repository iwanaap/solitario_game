export interface UserProfile {
  id: string
  email: string
  displayName: string
  photoUrl: string
  country: string
  provider: 'email'
  createdAt: string
}

interface StoredUser extends UserProfile {
  password?: string
}

const USERS_KEY = 'el-solitario-users'
const SESSION_KEY = 'el-solitario-session-user-id'
const PASSWORD_RESET_KEY = 'el-solitario-password-reset-requests'
const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000

interface PasswordResetRequest {
  email: string
  code: string
  expiresAt: number
}

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `user-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getUsers(): StoredUser[] {
  const rawUsers = localStorage.getItem(USERS_KEY)

  if (!rawUsers) {
    return []
  }

  try {
    const parsedUsers = JSON.parse(rawUsers) as StoredUser[]
    return Array.isArray(parsedUsers) ? parsedUsers : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getPasswordResetRequests(): PasswordResetRequest[] {
  const rawRequests = localStorage.getItem(PASSWORD_RESET_KEY)

  if (!rawRequests) {
    return []
  }

  try {
    const parsedRequests = JSON.parse(rawRequests) as PasswordResetRequest[]
    return Array.isArray(parsedRequests) ? parsedRequests : []
  } catch {
    return []
  }
}

function savePasswordResetRequests(requests: PasswordResetRequest[]): void {
  localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(requests))
}

function createResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function toProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    country: user.country ?? 'Sin país',
    provider: user.provider,
    createdAt: user.createdAt,
  }
}

export function getCurrentUser(): UserProfile | null {
  const userId = localStorage.getItem(SESSION_KEY)

  if (!userId) {
    return null
  }

  const user = getUsers().find((storedUser) => storedUser.id === userId)
  return user ? toProfile(user) : null
}

export function registerUser(email: string, password: string, displayName: string, photoUrl: string, country: string): UserProfile {
  const users = getUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Ya existe una cuenta con ese email.')
  }

  const normalizedDisplayName = displayName.trim().toLowerCase()

  if (users.some((user) => user.displayName.trim().toLowerCase() === normalizedDisplayName)) {
    throw new Error('Ese nombre visible ya está en uso.')
  }

  const user: StoredUser = {
    id: createId(),
    email: normalizedEmail,
    password,
    displayName: displayName.trim() || 'Jugador',
    photoUrl,
    country: country.trim() || 'Sin país',
    provider: 'email',
    createdAt: new Date().toISOString(),
  }

  saveUsers([user, ...users])
  localStorage.setItem(SESSION_KEY, user.id)
  return toProfile(user)
}

export function loginUser(email: string, password: string): UserProfile {
  const normalizedEmail = email.trim().toLowerCase()
  const user = getUsers().find((storedUser) => storedUser.email === normalizedEmail && storedUser.password === password)

  if (!user) {
    throw new Error('Email o contraseña incorrectos.')
  }

  localStorage.setItem(SESSION_KEY, user.id)
  return toProfile(user)
}

export function requestPasswordResetCode(email: string): string {
  const normalizedEmail = email.trim().toLowerCase()
  const users = getUsers()
  const userExists = users.some((user) => user.email === normalizedEmail)

  if (!userExists) {
    throw new Error('No existe una cuenta con ese email.')
  }

  const code = createResetCode()
  const activeRequests = getPasswordResetRequests().filter(
    (request) => request.email !== normalizedEmail && request.expiresAt > Date.now(),
  )

  savePasswordResetRequests([
    ...activeRequests,
    {
      email: normalizedEmail,
      code,
      expiresAt: Date.now() + PASSWORD_RESET_TTL_MS,
    },
  ])

  return code
}

export function confirmPasswordResetCode(email: string, code: string, nextPassword: string): void {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = code.trim()
  const requests = getPasswordResetRequests()
  const resetRequest = requests.find(
    (request) => request.email === normalizedEmail && request.code === normalizedCode,
  )

  if (!resetRequest || resetRequest.expiresAt <= Date.now()) {
    throw new Error('El código no es válido o ya expiró.')
  }

  if (nextPassword.trim().length < 4) {
    throw new Error('La nueva contraseña debe tener al menos 4 caracteres.')
  }

  const nextUsers = getUsers().map((user) =>
    user.email === normalizedEmail ? { ...user, password: nextPassword } : user,
  )

  saveUsers(nextUsers)
  savePasswordResetRequests(requests.filter((request) => request.email !== normalizedEmail))
}

export function updateCurrentUser(updates: Pick<UserProfile, 'displayName' | 'photoUrl' | 'country'>): UserProfile | null {
  const userId = localStorage.getItem(SESSION_KEY)

  if (!userId) {
    return null
  }

  const users = getUsers()
  const nextUsers = users.map((user) =>
    user.id === userId
      ? {
          ...user,
          displayName: updates.displayName.trim() || user.displayName,
          photoUrl: updates.photoUrl.trim() || user.photoUrl,
          country: updates.country.trim() || user.country || 'Sin país',
        }
      : user,
  )

  saveUsers(nextUsers)
  const updatedUser = nextUsers.find((user) => user.id === userId)
  return updatedUser ? toProfile(updatedUser) : null
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY)
}
