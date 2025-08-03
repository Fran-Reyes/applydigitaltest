import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';

type Entry = { fields?: Record<string, unknown>; sys?: { id?: string } };
type CdaList<T> = { total: number; skip: number; limit: number; items: T[] };

const MAX_RETRIES = 5;
const JITTER_MS = 250;

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly cfg: ConfigService,
    private readonly products: ProductsService,
  ) {}

  private http(): AxiosInstance {
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
      value && typeof value === 'object' && value !== null
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

  private buildUrl(skip: number, limit?: number): string {
    const s = this.cfg.get<string>('CONTENTFUL_SPACE_ID');
    const e = this.cfg.get<string>('CONTENTFUL_ENVIRONMENT');
    const c = this.cfg.get<string>('CONTENTFUL_CONTENT_TYPE') ?? 'product';
    const page = limit ?? Number(this.cfg.get('CONTENTFUL_PAGE_SIZE') ?? 100);
    const select =
      'fields.name,fields.category,fields.price,fields.currency,sys.id';
    return `/spaces/${s}/environments/${e}/entries?content_type=${c}&skip=${skip}&limit=${page}&select=${encodeURIComponent(
      select,
    )}`;
  }

  private async delay(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
  }

  private async fetchPage(
    client: AxiosInstance,
    skip: number,
    attempt = 0,
  ): Promise<CdaList<Entry>> {
    const url = this.buildUrl(skip);

    try {
      const { data } = await client.get<CdaList<Entry>>(url);
      return data;
    } catch (err) {
      const e = err as AxiosError<unknown>;
      const status = e.response?.status;
      const headers = (e.response?.headers ?? {}) as Record<string, string>;
      const msg =
        typeof e.response?.data === 'object' &&
        e.response?.data !== null &&
        'message' in e.response.data
          ? (e.response.data as { message?: string }).message
          : (e.message ?? 'Contentful request failed');

      if (status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = Number(headers['retry-after']);
        const reset = Number(headers['x-contentful-ratelimit-reset']);
        let baseMs: number;
        if (Number.isFinite(retryAfter)) {
          baseMs = retryAfter * 1000;
        } else if (Number.isFinite(reset)) {
          baseMs = reset * 1000;
        } else {
          baseMs = 500 * 2 ** attempt;
        }
        const wait = Math.round(baseMs + Math.random() * JITTER_MS);

        this.logger.warn(
          `429 rate limit (attempt ${attempt + 1}/${MAX_RETRIES}), waiting ${wait}ms…`,
        );
        await this.delay(wait);
        return this.fetchPage(client, skip, attempt + 1);
      }

      this.logger.error(`Contentful ${status ?? ''}: ${msg}`);
      throw e;
    }
  }

  async refreshOnce() {
    const client = this.http();
    let skip = 0;
    let total = 0;
    let imported = 0;
    const defaultPage = Number(this.cfg.get('CONTENTFUL_PAGE_SIZE') ?? 100);

    do {
      const page = await this.fetchPage(client, skip);
      total = page.total;

      for (const entry of page.items ?? []) {
        const m = this.mapEntry(entry);
        if (typeof m.contentfulId === 'string' && m.name) {
          await this.products.upsertFromContentful({
            ...m,
            contentfulId: m.contentfulId,
          });
          imported++;
        }
      }

      skip += page.limit ?? page.items?.length ?? defaultPage;
    } while (skip < total);

    return { total, imported };
  }

  @Cron(process.env.SYNC_CRON ?? CronExpression.EVERY_HOUR)
  async hourly() {
    this.logger.log('Running Contentful sync (cron)...');
    try {
      const res = await this.refreshOnce();
      this.logger.log(`Sync ok: imported=${res.imported}/${res.total}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Sync failed: ${msg}`);
    }
  }
}
