import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';

type Entry = { fields?: Record<string, unknown>; sys?: { id?: string } };
type CdaList<T> = { total: number; skip: number; limit: number; items: T[] };

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  constructor(
    private readonly cfg: ConfigService,
    private readonly products: ProductsService,
  ) {}

  private http() {
    const token = this.cfg.get<string>('CONTENTFUL_ACCESS_TOKEN');
    return axios.create({
      baseURL:
        this.cfg.get('CONTENTFUL_USE_PREVIEW') === 'true'
          ? 'https://preview.contentful.com'
          : 'https://cdn.contentful.com',
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
  }

  private pickLocalized<T extends string | number>(
    value: unknown,
    kind: 'string' | 'number',
    locale = 'en-US',
  ): T | null {
    const v =
      value &&
      typeof value === 'object' &&
      value !== null &&
      locale in (value as Record<string, unknown>)
        ? ((value as Record<string, unknown>)[locale] ?? value)
        : value;
    if (kind === 'number') {
      let n: number;
      if (typeof v === 'number') {
        n = v;
      } else if (typeof v === 'string') {
        n = Number(v);
      } else {
        n = NaN;
      }
      return Number.isFinite(n) ? (n as T) : null;
    }
    return typeof v === 'string' ? (v as T) : null;
  }

  private mapEntry(e: Entry) {
    const f = e.fields ?? {};
    const name = this.pickLocalized<string>(f['name'], 'string') ?? 'Unnamed';
    const category = this.pickLocalized<string>(f['category'], 'string');
    const price = this.pickLocalized<number>(f['price'], 'number');
    const currency = this.pickLocalized<string>(f['currency'], 'string');
    return { contentfulId: e.sys?.id, name, category, price, currency };
  }

  private async fetchPage(
    client: ReturnType<SyncService['http']>,
    skip: number,
    limit = 100,
  ): Promise<CdaList<Entry>> {
    const s = this.cfg.get<string>('CONTENTFUL_SPACE_ID');
    const e = this.cfg.get<string>('CONTENTFUL_ENVIRONMENT');
    const c = this.cfg.get<string>('CONTENTFUL_CONTENT_TYPE') ?? 'product';
    const url = `/spaces/${s}/environments/${e}/entries?content_type=${c}&skip=${skip}&limit=${limit}`;

    try {
      const { data } = await client.get<CdaList<Entry>>(url);
      return data;
    } catch (err) {
      const e = err as AxiosError<any>;
      const status = e.response?.status;
      let msg: string;
      if (
        e.response &&
        typeof (e.response.data as { message?: unknown })?.message === 'string'
      ) {
        msg = (e.response.data as { message: string }).message;
      } else if (typeof e.message === 'string') {
        msg = e.message;
      } else {
        msg = 'Unknown error';
      }
      this.logger.error(`Contentful ${status ?? ''}: ${msg}`);
      if (status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        return this.fetchPage(client, skip, limit);
      }
      throw e;
    }
  }

  async refreshOnce() {
    const client = this.http();
    let skip = 0,
      total = 0,
      imported = 0;
    const limit = 100; // o 1000 para minimizar páginas

    do {
      const page = await this.fetchPage(client, skip, limit);
      total = page.total;
      for (const entry of page.items ?? []) {
        const m = this.mapEntry(entry);
        if (typeof m.contentfulId === 'string' && m.name) {
          await this.products.upsertFromContentful({
            contentfulId: m.contentfulId,
            name: m.name,
            category: m.category,
            price: m.price,
            currency: m.currency,
          });
          imported++;
        }
      }
      skip += page.limit ?? page.items?.length ?? 0;
    } while (skip < total);

    return { total, imported };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hourly() {
    this.logger.log('Running hourly Contentful sync...');
    try {
      const res = await this.refreshOnce();
      this.logger.log(`Sync ok: imported=${res.imported}/${res.total}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Sync failed: ${msg}`);
    }
  }
}
