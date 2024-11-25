 
import { AuthProvidersList, IAuthProvider } from "@/utils/interfaces/providers.interfac";
import { GoogleAuthProvider } from "./provider/GoogleAuthProvider ";

export class AuthProviderFactory {
  static createProvider(
    providerName: AuthProvidersList,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): IAuthProvider
   {
    providerName = providerName.toLowerCase() as AuthProvidersList
    switch (providerName) {
      case "google":
        this.validateInputs(clientId, clientSecret, redirectUri);
        return new GoogleAuthProvider(clientId, clientSecret, redirectUri);
      case "github":
        this.validateInputs(clientId, clientSecret, redirectUri);
        return new GoogleAuthProvider(clientId, clientSecret, redirectUri);
      default:
        throw new Error(`Provider ${providerName} not supported.`);
    }
  }
  private static validateInputs(clientId: string, clientSecret: string, redirectUri: string): void {
    if (!clientId || clientId.trim() === "") {
      throw new Error("Client ID cannot be empty.");
    }

    if (!clientSecret || clientSecret.trim() === "") {
      throw new Error("Client Secret cannot be empty.");
    }

    if (!redirectUri || redirectUri.trim() === "") {
      throw new Error("Redirect URI cannot be empty.");
    }

    const redirectUrlRegex = /^(https?):\/\/[^\s$.?#].[^\s]*$/;
    if (!redirectUrlRegex.test(redirectUri)) {
      throw new Error("Redirect URI is not a valid URL.");
    }
  }
}
