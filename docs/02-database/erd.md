# نمودار ER کامل Binix

این سند مستقیماً از `prisma/schema.prisma` استخراج شده است. در تاریخ ۲۰۲۶-۰۸-۲۷، schema شامل ۲۲ مدل Prisma است. نمودار اول همه روابط را نشان می‌دهد؛ نمودارهای بعدی برای خوانایی، جزئیات هر دامنه را جدا می‌کنند.

## راهنمای علائم

- `PK`: کلید اصلی
- `FK`: کلید خارجی
- `UK`: مقدار یکتا
- `||`: دقیقاً یک
- `o|`: صفر یا یک
- `o{`: صفر تا چند

## نمای جامع روابط

```mermaid
erDiagram
  ACCESS_ROLE ||--o{ ACCESS_ROLE_PERMISSION : grants
  ACCESS_ROLE ||--o{ USER : assigned_to
  USER ||--o{ AUTH_SESSION : owns
  USER ||--o{ BUSINESS_MEMBER : participates
  BUSINESS ||--o{ BUSINESS_MEMBER : has
  BUSINESS ||--o{ BUSINESS_SERVICE : receives
  SERVICE_DEFINITION ||--o{ BUSINESS_SERVICE : assigned_as
  BUSINESS ||--o{ SERVICE_CREDENTIAL : owns
  SERVICE_DEFINITION ||--o{ SERVICE_CREDENTIAL : authenticates
  SERVICE_DEFINITION ||--o| AUTOMATION_CONNECTOR : connects_to
  SERVICE_DEFINITION ||--o{ SERVICE_PLAN : offers
  BUSINESS ||--o{ SUBSCRIPTION : subscribes
  SERVICE_DEFINITION ||--o{ SUBSCRIPTION : covers
  SERVICE_PLAN ||--o{ SUBSCRIPTION : selected_by
  BUSINESS ||--o{ ORDER : places
  USER o|--o{ ORDER : creates
  ORDER ||--o{ ORDER_ITEM : contains
  SERVICE_DEFINITION ||--o{ ORDER_ITEM : snapshots
  SERVICE_PLAN ||--o{ ORDER_ITEM : prices
  SUBSCRIPTION o|--o{ ORDER_ITEM : referenced_by
  ORDER ||--o{ PAYMENT : receives
  SUBSCRIPTION ||--o{ PROVISIONING_JOB : triggers
  BUSINESS ||--o{ PROVISIONING_JOB : scopes
  SERVICE_DEFINITION ||--o{ PROVISIONING_JOB : executes
  BUSINESS ||--o{ SUPPORT_TICKET : opens
  USER ||--o{ SUPPORT_TICKET : creates
  USER o|--o{ SUPPORT_TICKET : assigned_to
  SUPPORT_TICKET ||--o{ SUPPORT_TICKET_MESSAGE : contains
  USER ||--o{ SUPPORT_TICKET_MESSAGE : writes
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ AUDIT_LOG : acts
  BUSINESS o|--o{ AUDIT_LOG : scopes
```

`OTP_CHALLENGE` و `CONSULTATION_LEAD` در schema فعلی Foreign Key ندارند و بنابراین در نمودار رابطه‌ای بالا جدا هستند.

## هویت و دسترسی

```mermaid
erDiagram
  ACCESS_ROLE {
    uuid id PK
    string code UK
    string name
    string system_role UK
    boolean is_protected
    datetime created_at
  }
  ACCESS_ROLE_PERMISSION {
    uuid role_id PK,FK
    string permission_code PK
  }
  USER {
    uuid id PK
    string phone UK
    string email UK
    string name
    string system_role
    uuid access_role_id FK
    string status
    datetime last_login_at
  }
  AUTH_SESSION {
    uuid id PK
    string token_hash UK
    uuid user_id FK
    datetime expires_at
    datetime revoked_at
  }
  OTP_CHALLENGE {
    uuid id PK
    string phone
    string purpose
    string code_hash
    datetime expires_at
    int attempts
    int max_attempts
    datetime consumed_at
  }

  ACCESS_ROLE ||--o{ ACCESS_ROLE_PERMISSION : grants
  ACCESS_ROLE ||--o{ USER : assigned_to
  USER ||--o{ AUTH_SESSION : owns
```

نکته: `User.systemRole` برای سازگاری و bootstrap نگهداری می‌شود؛ نقش مدیریتی قابل‌کنترل با `accessRoleId` به `AccessRole` متصل است.

## کسب‌وکار و کاتالوگ سرویس

```mermaid
erDiagram
  USER {
    uuid id PK
    string phone UK
  }
  BUSINESS {
    uuid id PK
    string name
    string phone
    string category
    string status
    datetime archived_at
  }
  BUSINESS_MEMBER {
    uuid id PK
    uuid business_id FK
    uuid user_id FK
    string role
  }
  SERVICE_DEFINITION {
    string id PK
    string slug UK
    string name
    string availability
    string status
    string visibility
    json features
  }
  BUSINESS_SERVICE {
    uuid id PK
    uuid business_id FK
    string service_id FK
    string status
    boolean setup_completed
  }
  SERVICE_CREDENTIAL {
    uuid id PK
    uuid business_id FK
    string service_id FK
    string instance_key
    string kind
    string encrypted_value
  }
  AUTOMATION_CONNECTOR {
    uuid id PK
    string service_id FK,UK
    string status
    string endpoint_encrypted
    string auth_secret_encrypted
    string contract_version
    int timeout_seconds
  }

  USER ||--o{ BUSINESS_MEMBER : participates
  BUSINESS ||--o{ BUSINESS_MEMBER : has
  BUSINESS ||--o{ BUSINESS_SERVICE : receives
  SERVICE_DEFINITION ||--o{ BUSINESS_SERVICE : assigned_as
  BUSINESS ||--o{ SERVICE_CREDENTIAL : owns
  SERVICE_DEFINITION ||--o{ SERVICE_CREDENTIAL : secures
  SERVICE_DEFINITION ||--o| AUTOMATION_CONNECTOR : configures
```

قیود ترکیبی مهم:

- `BusinessMember`: عضویت با `(businessId, userId)` یکتا است.
- `BusinessService`: تخصیص با `(businessId, serviceId)` یکتا است.
- `ServiceCredential`: ترکیب `(businessId, serviceId, instanceKey, kind)` یکتا است.
- `AutomationConnector`: برای هر سرویس حداکثر یک connector وجود دارد.

## فروش، اشتراک و پرداخت

```mermaid
erDiagram
  BUSINESS {
    uuid id PK
    string status
  }
  USER {
    uuid id PK
  }
  SERVICE_DEFINITION {
    string id PK
    string name
  }
  SERVICE_PLAN {
    uuid id PK
    string service_id FK
    string code
    string name
    string status
    string billing_period
    bigint price_amount
    string currency
    int trial_days
  }
  SUBSCRIPTION {
    uuid id PK
    uuid business_id FK
    string service_id FK
    uuid plan_id FK
    string status
    string provisioning_status
    bigint price_amount
    datetime current_period_ends_at
    boolean auto_renew
  }
  ORDER {
    uuid id PK
    string order_number UK
    uuid business_id FK
    uuid created_by_user_id FK
    string status
    bigint total_amount
    datetime expires_at
    datetime paid_at
  }
  ORDER_ITEM {
    uuid id PK
    uuid order_id FK
    string service_id FK
    uuid plan_id FK
    uuid subscription_id FK
    string type
    bigint unit_amount
    int quantity
    bigint total_amount
  }
  PAYMENT {
    uuid id PK
    uuid order_id FK
    string provider
    string status
    bigint amount
    bigint refunded_amount
    string idempotency_key UK
    string provider_reference UK
  }

  SERVICE_DEFINITION ||--o{ SERVICE_PLAN : offers
  BUSINESS ||--o{ SUBSCRIPTION : subscribes
  SERVICE_DEFINITION ||--o{ SUBSCRIPTION : covers
  SERVICE_PLAN ||--o{ SUBSCRIPTION : selected_by
  BUSINESS ||--o{ ORDER : places
  USER o|--o{ ORDER : creates
  ORDER ||--o{ ORDER_ITEM : contains
  SERVICE_DEFINITION ||--o{ ORDER_ITEM : snapshots
  SERVICE_PLAN ||--o{ ORDER_ITEM : prices
  SUBSCRIPTION o|--o{ ORDER_ITEM : referenced_by
  ORDER ||--o{ PAYMENT : receives
```

مبالغ به ریال در `BigInt` ذخیره می‌شوند. `OrderItem` و `Subscription` snapshot قیمت و پلن را نگه می‌دارند تا تغییر آینده پلن، سوابق مالی را عوض نکند.

## عملیات و n8n

```mermaid
erDiagram
  BUSINESS {
    uuid id PK
  }
  SERVICE_DEFINITION {
    string id PK
  }
  SUBSCRIPTION {
    uuid id PK
    string provisioning_status
  }
  PROVISIONING_JOB {
    uuid id PK
    uuid subscription_id FK
    uuid business_id FK
    string service_id FK
    string action
    string status
    string idempotency_key UK
    int attempt_count
    int max_attempts
    datetime next_attempt_at
    string n8n_execution_id
    json payload
  }

  SUBSCRIPTION ||--o{ PROVISIONING_JOB : triggers
  BUSINESS ||--o{ PROVISIONING_JOB : scopes
  SERVICE_DEFINITION ||--o{ PROVISIONING_JOB : executes
```

وجود `ProvisioningJob` نشان‌دهنده صف و وضعیت داخلی است؛ تا زمان تکمیل worker و callback، رابطه فوق به معنی اجرای end-to-end n8n نیست.

## پشتیبانی، اعلان و Audit

```mermaid
erDiagram
  USER {
    uuid id PK
  }
  BUSINESS {
    uuid id PK
  }
  SUPPORT_TICKET {
    uuid id PK
    string ticket_number UK
    uuid business_id FK
    uuid created_by_user_id FK
    uuid assigned_to_user_id FK
    string status
    string priority
    datetime first_response_due_at
    datetime resolution_due_at
  }
  SUPPORT_TICKET_MESSAGE {
    uuid id PK
    uuid ticket_id FK
    uuid author_user_id FK
    string body
    boolean is_internal
  }
  NOTIFICATION {
    uuid id PK
    uuid user_id FK
    string kind
    string title
    string href
    datetime read_at
  }
  AUDIT_LOG {
    uuid id PK
    uuid actor_user_id FK
    uuid business_id FK
    string action
    string target_type
    string target_id
    json metadata
    uuid request_id
    datetime created_at
  }
  CONSULTATION_LEAD {
    uuid id PK
    string phone
    string need
    string source
    string status
    datetime consent_at
  }

  BUSINESS ||--o{ SUPPORT_TICKET : owns
  USER ||--o{ SUPPORT_TICKET : creates
  USER o|--o{ SUPPORT_TICKET : assigned_to
  SUPPORT_TICKET ||--o{ SUPPORT_TICKET_MESSAGE : contains
  USER ||--o{ SUPPORT_TICKET_MESSAGE : writes
  USER ||--o{ NOTIFICATION : receives
  USER ||--o{ AUDIT_LOG : acts
  BUSINESS o|--o{ AUDIT_LOG : scopes
```

## رفتار حذف روابط

| رابطه | `onDelete` |
|---|---|
| Role → Permission | `CASCADE` |
| User → Session/Notification | `CASCADE` |
| Business/User → BusinessMember | `CASCADE` |
| Business → BusinessService/Credential | `CASCADE` |
| ServiceDefinition → AutomationConnector | `CASCADE` |
| ServiceDefinition در تخصیص، پلن، فروش و عملیات | عمدتاً `RESTRICT` |
| User → Order creator / Ticket assignee | `SET NULL` |
| Business → AuditLog | `SET NULL` |
| Ticket → Message | `CASCADE` |
| موجودیت‌های مالی و اشتراک | عمدتاً `RESTRICT` |

این جدول برای درک سریع است؛ مرجع قطعی همیشه `prisma/schema.prisma` و migrationهای اعمال‌شده هستند.

