// Mirrors modules/auth/requests.go and modules/auth/responses.go in the Go service.

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ResetPasswordInput {
  token: string
  otp: number
  new_password: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export type Role = 'user' | 'admin'

/** What the client knows about the signed-in user from the access token's claims (helpers/jwt.go). */
export interface Session {
  userId: number
  role: Role
}
