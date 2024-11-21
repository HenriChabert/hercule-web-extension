export interface HealthResponse {
  status: string;
}

export interface Trigger {
  id: string;
  name: string;
  source: "n8n" | "zapier" | "make" | "webflow";
  url_regex: string | null;
}
