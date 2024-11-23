import { WebhookEntity } from "@/factory/entities/webhook.entity";
import { InjectRepository } from "@/factory/typeorm";
import axios from "axios";
const webhookRepository = InjectRepository(WebhookEntity)
export class WebhookService {
  constructor() { }

  async triggerWebhook(applicationId: number, event: string, payload: any): Promise<void> {
    const webhooks = await webhookRepository.find({ where: { applicationId, event } });
    if (webhooks.length === 0) {
      return
    }
    for (const webhook of webhooks) {
      try {
        await axios.post(webhook.url, payload);
      } catch (error: any) {
        console.error(`Failed to trigger webhook for event: ${event}`, error.message);
      }
    }
  }
}
