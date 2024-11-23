import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HealthResponse, Trigger, TriggerEventResponseItem } from "./hercule-api.types";
import { TriggerEventContext } from "@/types/events.type";
import { camelCaseToSnakeCase } from "@/helpers/utils.helper";

export class HerculeApi {
  public serverUrl: string | null = null;

  private client: AxiosInstance;
  private secretKey: string | null = null;

  constructor() {
    this.client = axios.create();
  }

  preparePayload(payload: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        camelCaseToSnakeCase(key),
        value && typeof value === "object" && !Array.isArray(value)
          ? this.preparePayload(value as Record<string, unknown>)
          : value,
      ])
    );
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

  async listTriggers({ event }: { event?: "button_clicked" | "page_opened" }): Promise<Trigger[]> {
    const response: AxiosResponse<Trigger[]> = await this.client.get("/triggers", {
      params: {
        event,
      },
    });
    return response.data;
  }

  async runTrigger(
    triggerId: string,
    context: Record<string, unknown>
  ): Promise<{ success: boolean; payload: { message: string } }> {
    try {
      await this.client.post(`/trigger/${triggerId}/run`, context);
      return { success: true, payload: { message: "Trigger run successfully" } };
    } catch (error) {
      console.error("Error running trigger:", error);
      return { success: false, payload: { message: "Error running trigger" } };
    }
  }

  async triggerEvent({
    event,
    context,
  }: {
    event: "button_clicked" | "page_opened";
    context: TriggerEventContext;
  }): Promise<{ success: boolean; payload?: TriggerEventResponseItem[] }> {
    const payload = this.preparePayload({ event, context });
    try {
      const response: AxiosResponse<TriggerEventResponseItem[]> = await this.client.post(`/triggers/event`, payload);
      console.log("response", response);
      return { success: true, payload: response.data };
    } catch (error) {
      console.error("Error running trigger:", error);
      return { success: false };
    }
  }
}

export default HerculeApi;
