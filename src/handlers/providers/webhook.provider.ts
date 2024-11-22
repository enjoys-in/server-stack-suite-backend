import { WebhookEntity } from "@/factory/entities/webhook.entity";
import axios from "axios";
import { Repository } from "typeorm";

export class WebhookService {
  constructor(private webhookRepository: Repository<WebhookEntity>) {}

  async triggerWebhook(applicationId: number, event: string, payload: any): Promise<void> {
    const webhooks = await this.webhookRepository.find({ where: { applicationId, event } });
    for (const webhook of webhooks) {
      try {
        await axios.post(webhook.url, payload);
      } catch (error: any) {
        console.error(`Failed to trigger webhook for event: ${event}`, error.message);
      }
    }
  }
}
