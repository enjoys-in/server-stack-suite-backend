export type AuthProvidersList = "google" | "facebook" | "github";
export type RepoProvidersList = "gitlab" | "bitbucket" | "github";

export interface IAuthProvider {
  getAuthUrl(): string;
  handleCallback<T>(code: string): Promise<T>;
  refreshToken<T>(refresh_token: string): Promise<T>;
}

export interface GithubAuthProviderResponse  {
  access_token: string
  expires_in: string
  refresh_token: string
  refresh_token_expires_in: string
  scope: string
  token_type: string
}