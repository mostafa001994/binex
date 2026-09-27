import { getDataDriver } from "@/server/config/data-driver";

import type { SystemRepository } from "@/server/repositories/contracts/system-repository";
import type { UserRepository } from "@/server/repositories/contracts/user-repository";
import type { OtpRepository } from "@/server/repositories/contracts/otp-repository";
import type { SessionRepository } from "@/server/repositories/contracts/session-repository";
import type { BusinessRepository } from "@/server/repositories/contracts/business-repository";
import type { BusinessMemberRepository } from "@/server/repositories/contracts/business-member-repository";
import type { BusinessServiceRepository } from "@/server/repositories/contracts/business-service-repository";
import type { ServiceCatalogRepository } from "@/server/repositories/contracts/service-catalog-repository";
import type { AuditRepository } from "@/server/repositories/contracts/audit-repository";
import type { SalesAgentRepository } from "@/server/repositories/contracts/sales-agent-repository";
import type { ServicePlanRepository } from "@/server/repositories/contracts/service-plan-repository";
import type { SubscriptionRepository } from "@/server/repositories/contracts/subscription-repository";
import type { CommerceRepository } from "@/server/repositories/contracts/commerce-repository";
import type { ProvisioningRepository } from "@/server/repositories/contracts/provisioning-repository";
import type { AdminDashboardRepository } from "@/server/repositories/contracts/admin-dashboard-repository";
import type { PaymentGatewayRepository } from "@/server/repositories/contracts/payment-gateway-repository";
import type { NotificationRuleRepository } from "@/server/repositories/contracts/notification-rule-repository";
import type { NotificationTemplateRepository } from "@/server/repositories/contracts/notification-template-repository";
import type { NotificationLogRepository } from "@/server/repositories/contracts/notification-log-repository";
import type { ContentGeneratorRepository } from "@/server/repositories/contracts/content-generator-repository";

import { DatabaseSystemRepository } from "@/server/repositories/database/database-system-repository";
import { DatabaseUserRepository } from "@/server/repositories/database/database-user-repository";
import { DatabaseOtpRepository } from "@/server/repositories/database/database-otp-repository";
import { DatabaseSessionRepository } from "@/server/repositories/database/database-session-repository";
import { DatabaseBusinessRepository } from "@/server/repositories/database/database-business-repository";
import { DatabaseBusinessMemberRepository } from "@/server/repositories/database/database-business-member-repository";
import { DatabaseBusinessServiceRepository } from "@/server/repositories/database/database-business-service-repository";
import { DatabaseServiceCatalogRepository } from "@/server/repositories/database/database-service-catalog-repository";
import { DatabaseAuditRepository } from "@/server/repositories/database/database-audit-repository";
import { DatabaseSalesAgentRepository } from "@/server/repositories/database/database-sales-agent-repository";
import { DatabaseServicePlanRepository } from "@/server/repositories/database/database-service-plan-repository";
import { DatabaseSubscriptionRepository } from "@/server/repositories/database/database-subscription-repository";
import { DatabaseCommerceRepository } from "@/server/repositories/database/database-commerce-repository";
import { DatabaseProvisioningRepository } from "@/server/repositories/database/database-provisioning-repository";
import { DatabasePaymentGatewayRepository } from "@/server/repositories/database/database-payment-gateway-repository";
import { DatabaseNotificationRuleRepository } from "@/server/repositories/database/database-notification-rule-repository";
import { DatabaseContentGeneratorRepository } from "@/server/repositories/database/database-content-generator-repository";
import { DatabaseAdminDashboardRepository } from "@/server/repositories/database/database-admin-dashboard-repository";

import { MockSystemRepository } from "@/server/repositories/mock/mock-system-repository";
import { MockUserRepository } from "@/server/repositories/mock/mock-user-repository";
import { MockOtpRepository } from "@/server/repositories/mock/mock-otp-repository";
import { MockSessionRepository } from "@/server/repositories/mock/mock-session-repository";
import { MockBusinessRepository } from "@/server/repositories/mock/mock-business-repository";
import { MockBusinessMemberRepository } from "@/server/repositories/mock/mock-business-member-repository";
import { MockBusinessServiceRepository } from "@/server/repositories/mock/mock-business-service-repository";
import { MockServiceCatalogRepository } from "@/server/repositories/mock/mock-service-catalog-repository";
import { MockAuditRepository } from "@/server/repositories/mock/mock-audit-repository";
import { MockSalesAgentRepository } from "@/server/repositories/mock/mock-sales-agent-repository";
import { MockServicePlanRepository } from "@/server/repositories/mock/mock-service-plan-repository";
import { MockSubscriptionRepository } from "@/server/repositories/mock/mock-subscription-repository";
import { MockCommerceRepository } from "@/server/repositories/mock/mock-commerce-repository";
import { MockProvisioningRepository } from "@/server/repositories/mock/mock-provisioning-repository";
import { MockAdminDashboardRepository } from "@/server/repositories/mock/mock-admin-dashboard-repository";
import { MockPaymentGatewayRepository } from "@/server/repositories/mock/mock-payment-gateway-repository";
import { MockContentGeneratorRepository } from "@/server/repositories/mock/mock-content-generator-repository";
import { DatabaseNotificationTemplateRepository } from "@/server/repositories/database/database-notification-template-repository";
import { MockNotificationTemplateRepository } from "@/server/repositories/mock/mock-notification-template-repository";
import { DatabaseNotificationLogRepository } from "@/server/repositories/database/database-notification-log-repository";
import type { NotificationEventRepository,} from "@/server/repositories/contracts/notification-event-repository";
import { DatabaseNotificationEventRepository,} from "@/server/repositories/database/database-notification-event-repository";

let systemRepository: SystemRepository | null = null;
let userRepository: UserRepository | null = null;
let otpRepository: OtpRepository | null = null;
let sessionRepository: SessionRepository | null = null;
let businessRepository: BusinessRepository | null = null;
let businessMemberRepository: BusinessMemberRepository | null = null;
let businessServiceRepository: BusinessServiceRepository | null = null;
let serviceCatalogRepository: ServiceCatalogRepository | null = null;
let auditRepository: AuditRepository | null = null;
let salesAgentRepository: SalesAgentRepository | null = null;
let servicePlanRepository: ServicePlanRepository | null = null;
let subscriptionRepository: SubscriptionRepository | null = null;
let commerceRepository: CommerceRepository | null = null;
let provisioningRepository: ProvisioningRepository | null = null;
let adminDashboardRepository: AdminDashboardRepository | null = null;
let paymentGatewayRepository: PaymentGatewayRepository | null = null;
let contentGeneratorRepository: ContentGeneratorRepository | null = null;

let notificationRuleRepository: NotificationRuleRepository | null = null;

let notificationTemplateRepository: NotificationTemplateRepository | null = null;

let notificationLogRepository: NotificationLogRepository | null = null;

let notificationEventRepository: NotificationEventRepository | null = null;

function isDatabase() {
  return getDataDriver() === "database";
}

export function getSystemRepository(): SystemRepository {
  if (!systemRepository) {
    systemRepository = isDatabase()
      ? new DatabaseSystemRepository()
      : new MockSystemRepository();
  }
  return systemRepository;
}

export function getUserRepository(): UserRepository {
  if (!userRepository) {
    userRepository = isDatabase()
      ? new DatabaseUserRepository()
      : new MockUserRepository();
  }
  return userRepository;
}

export function getOtpRepository(): OtpRepository {
  if (!otpRepository) {
    otpRepository = isDatabase()
      ? new DatabaseOtpRepository()
      : new MockOtpRepository();
  }
  return otpRepository;
}

export function getSessionRepository(): SessionRepository {
  if (!sessionRepository) {
    sessionRepository = isDatabase()
      ? new DatabaseSessionRepository()
      : new MockSessionRepository();
  }
  return sessionRepository;
}

export function getBusinessRepository(): BusinessRepository {
  if (!businessRepository) {
    businessRepository = isDatabase()
      ? new DatabaseBusinessRepository()
      : new MockBusinessRepository();
  }
  return businessRepository;
}

export function getBusinessMemberRepository(): BusinessMemberRepository {
  if (!businessMemberRepository) {
    businessMemberRepository = isDatabase()
      ? new DatabaseBusinessMemberRepository()
      : new MockBusinessMemberRepository();
  }
  return businessMemberRepository;
}

export function getBusinessServiceRepository(): BusinessServiceRepository {
  if (!businessServiceRepository) {
    businessServiceRepository = isDatabase()
      ? new DatabaseBusinessServiceRepository()
      : new MockBusinessServiceRepository();
  }
  return businessServiceRepository;
}

export function getServiceCatalogRepository(): ServiceCatalogRepository {
  if (!serviceCatalogRepository) {
    serviceCatalogRepository = isDatabase()
      ? new DatabaseServiceCatalogRepository()
      : new MockServiceCatalogRepository();
  }
  return serviceCatalogRepository;
}

export function getAuditRepository(): AuditRepository {
  if (!auditRepository) {
    auditRepository = isDatabase()
      ? new DatabaseAuditRepository()
      : new MockAuditRepository();
  }
  return auditRepository;
}


export function getSalesAgentRepository(): SalesAgentRepository {
  if (!salesAgentRepository) {
    salesAgentRepository = isDatabase()
      ? new DatabaseSalesAgentRepository()
      : new MockSalesAgentRepository();
  }

  return salesAgentRepository;
}

export function getServicePlanRepository(): ServicePlanRepository {
  if (!servicePlanRepository) {
    servicePlanRepository = isDatabase()
      ? new DatabaseServicePlanRepository()
      : new MockServicePlanRepository();
  }
  return servicePlanRepository;
}

export function getSubscriptionRepository(): SubscriptionRepository {
  if (!subscriptionRepository) {
    subscriptionRepository = isDatabase()
      ? new DatabaseSubscriptionRepository()
      : new MockSubscriptionRepository();
  }
  return subscriptionRepository;
}

export function getCommerceRepository(): CommerceRepository {
  if (!commerceRepository) {
    commerceRepository = isDatabase()
      ? new DatabaseCommerceRepository()
      : new MockCommerceRepository();
  }
  return commerceRepository;
}

export function getProvisioningRepository(): ProvisioningRepository {
  if (!provisioningRepository) {
    provisioningRepository = isDatabase()
      ? new DatabaseProvisioningRepository()
      : new MockProvisioningRepository();
  }
  return provisioningRepository;
}

export function getAdminDashboardRepository(): AdminDashboardRepository {
  if (!adminDashboardRepository) {
    adminDashboardRepository = isDatabase()
      ? new DatabaseAdminDashboardRepository()
      : new MockAdminDashboardRepository();
  }
  return adminDashboardRepository;
}


export function getPaymentGatewayRepository()
: PaymentGatewayRepository {

  if (!paymentGatewayRepository) {

    paymentGatewayRepository =
      isDatabase()
        ? new DatabasePaymentGatewayRepository()
        : new MockPaymentGatewayRepository();

  }

  return paymentGatewayRepository;

}

export function getContentGeneratorRepository(): ContentGeneratorRepository {
  if (!contentGeneratorRepository) {
    contentGeneratorRepository = isDatabase()
      ? new DatabaseContentGeneratorRepository()
      : new MockContentGeneratorRepository();
  }

  return contentGeneratorRepository;
}


import type {
  NotificationProviderRepository,
} from "./contracts/notification-provider-repository";

import {
  DatabaseNotificationProviderRepository,
} from "./database/database-notification-provider-repository";

import {
  MockNotificationProviderRepository,
} from "./mock/mock-notification-provider-repository";


let notificationProviderRepository:
  NotificationProviderRepository | null = null;


export function getNotificationProviderRepository()
: NotificationProviderRepository {


  if(!notificationProviderRepository){

    notificationProviderRepository =
      isDatabase()
      ? new DatabaseNotificationProviderRepository()
      : new MockNotificationProviderRepository();

  }


  return notificationProviderRepository;

}



export function getNotificationTemplateRepository()
: NotificationTemplateRepository {


 if(!notificationTemplateRepository){

  notificationTemplateRepository =
    process.env.DATABASE_URL
    ? new DatabaseNotificationTemplateRepository()
    : new MockNotificationTemplateRepository();

 }


 return notificationTemplateRepository;

}



export function getNotificationLogRepository()
: NotificationLogRepository {


 if(!notificationLogRepository){

  notificationLogRepository =
   new DatabaseNotificationLogRepository();

 }


 return notificationLogRepository;

}



export function getNotificationRuleRepository()
: NotificationRuleRepository {

 if (!notificationRuleRepository) {

  notificationRuleRepository =
   new DatabaseNotificationRuleRepository();

 }

 return notificationRuleRepository;

}

export function getNotificationEventRepository()
:NotificationEventRepository {


 if(!notificationEventRepository){

  notificationEventRepository =
   new DatabaseNotificationEventRepository();

 }


 return notificationEventRepository;

}
