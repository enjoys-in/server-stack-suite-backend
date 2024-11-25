export type AuthProvidersList = "google" | "facebook" | "github";
export type RepoProvidersList = "gitlab" | "bitbucket" | "github";
 
export interface IAuthProvider {
    getAuthUrl(): string;
    handleCallback(code: string): Promise<{ accessToken: string; user: any }>;
  }
