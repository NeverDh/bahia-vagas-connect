import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import type { Request } from 'express';
import { MoreThanOrEqual, Repository } from 'typeorm';
import {
  AnalyticsPageView,
  AnalyticsSession,
  AnalyticsVisitor,
} from '../entities/analytics.entity.js';
import type { TrackVisitDto } from './dto/track-visit.dto.js';

function parseDevice(ua: string): { device: string; browser: string; os: string } {
  let device = 'Desktop';
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  let browser = 'Outro';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  let os = 'Outro';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const fromForwarded =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : Array.isArray(forwarded)
        ? forwarded[0]?.trim()
        : undefined;
  return (
    fromForwarded ||
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    'unknown'
  );
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsVisitor)
    private readonly visitorRepo: Repository<AnalyticsVisitor>,
    @InjectRepository(AnalyticsSession)
    private readonly sessionRepo: Repository<AnalyticsSession>,
    @InjectRepository(AnalyticsPageView)
    private readonly pageViewRepo: Repository<AnalyticsPageView>,
    private readonly config: ConfigService,
  ) {}

  private ipSalt(): string {
    return (
      this.config.get<string>('ANALYTICS_IP_SALT') ?? 'bahiavagas-salt-2026'
    );
  }

  hashIp(ip: string): string {
    return createHash('sha256')
      .update(ip + this.ipSalt())
      .digest('hex');
  }

  async track(
    req: Request,
    dto: TrackVisitDto,
  ): Promise<{ session_id: string; visitor_id: string }> {
    const ip = extractClientIp(req);
    const ipHash = this.hashIp(ip);
    const userAgent = req.headers['user-agent'] ?? '';
    const { device, browser, os } = parseDevice(userAgent);
    const country = (req.headers['cf-ipcountry'] as string) || 'BR';
    const city = (req.headers['cf-ipcity'] as string) || null;
    const region = (req.headers['cf-region'] as string) || null;
    const isAdmin = dto.is_admin === true;

    let visitor = await this.visitorRepo.findOne({ where: { ip_hash: ipHash } });
    const now = new Date();

    if (visitor) {
      await this.visitorRepo.update(visitor.id, {
        last_visit: now,
        is_returning: true,
        visit_count: visitor.visit_count + 1,
        is_admin: isAdmin || visitor.is_admin,
      });
      visitor = (await this.visitorRepo.findOne({ where: { id: visitor.id } }))!;
    } else {
      const created = this.visitorRepo.create({
        ip_hash: ipHash,
        first_visit: now,
        last_visit: now,
        is_returning: false,
        visit_count: 1,
        is_admin: isAdmin,
      });
      visitor = await this.visitorRepo.save(created);
    }

    let sessionId = dto.session_id ?? null;
    if (sessionId) {
      const existingSession = await this.sessionRepo.findOne({
        where: { id: sessionId, visitor_id: visitor.id },
      });
      if (!existingSession) {
        sessionId = null;
      }
    }

    if (!sessionId) {
      const session = this.sessionRepo.create({
        visitor_id: visitor.id,
        started_at: now,
        device,
        browser,
        os,
        country,
        city,
        region,
        referrer: dto.referrer ?? null,
        is_admin: isAdmin,
      });
      const saved = await this.sessionRepo.save(session);
      sessionId = saved.id;
    }

    const pv = this.pageViewRepo.create({
      session_id: sessionId,
      page_url: dto.page_url,
      page_title: dto.page_title ?? null,
      viewed_at: now,
    });
    await this.pageViewRepo.save(pv);

    return { session_id: sessionId, visitor_id: visitor.id };
  }

  async listForAdmin(since: Date): Promise<{
    visitors: Record<string, unknown>[];
    sessions: Record<string, unknown>[];
    page_views: Record<string, unknown>[];
  }> {
    const [visitors, sessions, pageViews] = await Promise.all([
      this.visitorRepo.find({
        where: { last_visit: MoreThanOrEqual(since) },
        order: { last_visit: 'DESC' },
      }),
      this.sessionRepo.find({
        where: { started_at: MoreThanOrEqual(since) },
        order: { started_at: 'DESC' },
      }),
      this.pageViewRepo.find({
        where: { viewed_at: MoreThanOrEqual(since) },
        order: { viewed_at: 'DESC' },
      }),
    ]);

    return {
      visitors: visitors.map((v) => this.serializeVisitor(v)),
      sessions: sessions.map((s) => this.serializeSession(s)),
      page_views: pageViews.map((p) => this.serializePageView(p)),
    };
  }

  private serializeVisitor(v: AnalyticsVisitor): Record<string, unknown> {
    return {
      id: v.id,
      ip_hash: v.ip_hash,
      first_visit: v.first_visit.toISOString(),
      last_visit: v.last_visit.toISOString(),
      is_returning: v.is_returning,
      visit_count: v.visit_count,
      is_admin: v.is_admin,
    };
  }

  private serializeSession(s: AnalyticsSession): Record<string, unknown> {
    return {
      id: s.id,
      visitor_id: s.visitor_id,
      started_at: s.started_at.toISOString(),
      ended_at: s.ended_at
        ? s.ended_at instanceof Date
          ? s.ended_at.toISOString()
          : s.ended_at
        : null,
      device: s.device,
      browser: s.browser,
      os: s.os,
      country: s.country,
      city: s.city,
      region: s.region,
      referrer: s.referrer,
      is_admin: s.is_admin,
    };
  }

  private serializePageView(p: AnalyticsPageView): Record<string, unknown> {
    return {
      id: p.id,
      session_id: p.session_id,
      page_url: p.page_url,
      page_title: p.page_title,
      viewed_at: p.viewed_at.toISOString(),
      duration_seconds: p.duration_seconds,
    };
  }
}
