import axios, { AxiosInstance, AxiosResponse } from "axios";
import { HealthResponse, LoginResponse, Trigger, TriggerEventResponse, TriggerEventResponseItem, MeResponse } from "./hercule-api.types";
import { TriggerEventContext } from "@/types/events.type";
import { camelCaseToSnakeCase } from "@/helpers/utils.helper";
import { StorageHelper } from "@/helpers/storage.helper";
import { EventId } from "@/types/events.type";

const storageHelper = new StorageHelper({ storageType: "local" });
let cachedHerculeApi: HerculeApi | null = null;

export const herculeApiFromStorage = async () => {
  if (cachedHerculeApi) {
    return cachedHerculeApi;
  }

  const herculeApi = new HerculeApi();

  const serverUrl = await storageHelper.getData<string>("serverUrl");

  if (serverUrl) {
    try {
      await herculeApi.connect({ serverUrl: serverUrl });
    } catch (error) {
      console.error("Error initializing Hercule API:", error);
    }
  }

  cachedHerculeApi = herculeApi;
  return herculeApi;
};

export class HerculeApi {
  public serverUrl: string | null = null;

  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "",
    });

    this.client.interceptors.request.use((config) => {
      console.debug("🚀 Sending request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
      return config;
    });

    this.client.interceptors.response.use((response) => {
      console.debug("✅ Received response:", {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      return response;
    });
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

  validateCredentials({ serverUrl }: { serverUrl: string; }): boolean {
    const validURL = this.validateServerUrl(serverUrl);

    return validURL;
  }

  isInitialized(): boolean {
    return this.serverUrl !== null;
  }

  // Method to authenticate and store the token
  async connect({ serverUrl }: { serverUrl: string }): Promise<void> {
    try {
      if (!(await this.validateCredentials({ serverUrl }))) {
        throw new Error("Invalid credentials. Please check the URL and secret key");
      }

      this.serverUrl = serverUrl;

      this.client.defaults.baseURL = `${this.serverUrl}/api/v1`;

      const isConnected = await this.isConnected();

      if (!isConnected) {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.serverUrl = null;
  }

  async getHealthSecured(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await this.client.get("/health");
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

  async isAuthenticated(): Promise<boolean> {
    const token = await this.retrieveAuthToken();
    if (!token) {
      return false;
    }

    try {
      await this.me();
      return true;
    } catch {
      return false;
    }
  }

  async storeAuthToken(token: string): Promise<void> {
    await storageHelper.setData("authToken", token);
  }

  async retrieveAuthToken(): Promise<string | null> {
    return await storageHelper.getData<string>("authToken") ?? null;
  }

  async eraseAuthToken(): Promise<void> {
    await storageHelper.eraseData("authToken");
  }

  async setAuthToken(token: string): Promise<void> {
    this.client.defaults.headers["Authorization"] = `Bearer ${token}`;
    await this.storeAuthToken(token);
  }

  async removeAuthToken(): Promise<void> {
    delete this.client.defaults.headers["Authorization"];
    await this.eraseAuthToken();
  }

  async login({ email, password }: { email: string; password: string }): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post("/auth/login", { email, password });
    if (response.data.token) {
      await this.setAuthToken(response.data.token.access_token);
    }
    return response.data;
  }

  async me(): Promise<MeResponse> {
    const response: AxiosResponse<MeResponse> = await this.client.get("/auth/me");
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
    await this.removeAuthToken();
  }

  async listTriggers({ event, url }: { event?: EventId; url?: string }): Promise<Trigger[]> {
    const response: AxiosResponse<Trigger[]> = await this.client.get("/triggers", {
      params: {
        event,
        url,
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
    webPushSubscription,
  }: {
    event: EventId;
    context: TriggerEventContext;
    webPushSubscription?: PushSubscription;
  }): Promise<TriggerEventResponse> {
    const payload = {
      event,
      context,
      web_push_subscription: webPushSubscription?.toJSON(),
    };
    try {
      const response: AxiosResponse<TriggerEventResponseItem[]> = await this.client.post(`/triggers/event`, payload);
      return { success: true, payload: response.data };
    } catch (error) {
      console.error("Error running trigger:", error);
      return { success: false };
    }
  }

  async getServerPublicKey(): Promise<string> {
    const response: AxiosResponse<{
      public_key: string;
    }> = await this.client.get("/webpush/public-key");
    return response.data.public_key;
  }
}

export default HerculeApi;
