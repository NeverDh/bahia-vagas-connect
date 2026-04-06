/**
 * Barrel export — Todas as entities da aplicação.
 *
 * Importar por aqui:
 * import { Job, Company, UserRole } from './entities/index.js';
 */

export { Company } from './company.entity.js';
export { Job, JobStatus, ContractType, ExperienceLevel } from './job.entity.js';
export { CandidateProfile } from './candidate-profile.entity.js';
export { Application } from './application.entity.js';
export { UserRole, AppRole } from './user-role.entity.js';
export { BlogPost } from './blog-post.entity.js';
export { MetaTag } from './meta-tag.entity.js';
export {
  AnalyticsVisitor,
  AnalyticsSession,
  AnalyticsPageView,
} from './analytics.entity.js';
