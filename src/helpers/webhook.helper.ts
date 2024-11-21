import axios from 'axios';

export async function callWebhook(url: string, payload: any): Promise<void> {
  try {
    const response = await axios.post(url, payload);
    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error: any) {
    throw new Error(`Error calling webhook: ${error.message}`);
  }
}