import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HealthResponse, Trigger } from "./hercule-api.types";

export class HerculeApi {
  public serverUrl: string | null = null;

  private client: AxiosInstance;
  private secretKey: string | null = null;

  constructor() {
    this.client = axios.create();
  }

  validateServerUrl(serverUrl: string): boolean {
    const URLRegex = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(:[0-9]+)?$/;
    return URLRegex.test(serverUrl);
  }

  validateCredentials({ serverUrl, secretKey }: { serverUrl: string; secretKey: string }): boolean {
    const validURL = this.validateServerUrl(serverUrl);
    const validSecretKey = secretKey.length > 0;

    return validURL && validSecretKey;
  }

  isInitialized(): boolean {
    return this.serverUrl !== null && this.secretKey !== null;
  }

  // Method to authenticate and store the token
  async connect({ serverUrl, secretKey }: { serverUrl: string; secretKey: string }): Promise<void> {
    try {
      if (!(await this.validateCredentials({ serverUrl, secretKey }))) {
        throw new Error("Invalid credentials. Please check the URL and secret key");
      }

      this.secretKey = secretKey;
      this.serverUrl = serverUrl;

      this.client.defaults.baseURL = `${this.serverUrl}/api/v1`;
      this.client.defaults.headers["X-Hercule-Secret-Key"] = this.secretKey;

      const isConnected = await this.isConnected();

      if (!isConnected) {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  }

  async getHealthSecured(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await this.client.get("/health-secured");
    return response.data;
  }

  // Method to check if authentication is valid by testing an authenticated endpoint
  async isConnected(): Promise<boolean> {
    const isInitialized = this.isInitialized();
    if (!isInitialized) {
      return false;
    }

    try {
      const response = await this.getHealthSecured();
      if (response.status === "ok") {
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  async listTriggers(): Promise<Trigger[]> {
    const response: AxiosResponse<Trigger[]> = await this.client.get("/triggers");
    return response.data;
  }

  async runTrigger(triggerId: string, context: any): Promise<{ success: boolean; payload: { message: string } }> {
    try {
      const response: AxiosResponse<void> = await this.client.post(`/trigger/${triggerId}/run`, context);
      return { success: true, payload: { message: "Trigger run successfully" } };
    } catch (error) {
      console.error("Error running trigger:", error);
      return { success: false, payload: { message: "Error running trigger" } };
    }
  }
}

export default HerculeApi;
