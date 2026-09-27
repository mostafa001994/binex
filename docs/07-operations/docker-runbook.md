# راهنمای Docker

## اجزای محلی

- `postgres`: دیتابیس مشترک زیرساختی با دیتابیس و role جداگانه Binix
- `pgadmin`: ابزار مدیریت دیتابیس
- `binix-web-1`: برنامه Binix
- `n8n`: موتور workflow؛ مستقل از lifecycle وب Binix

Binix و PostgreSQL روی شبکه خارجی `shared_postgres` قرار می‌گیرند. نام DNS دیتابیس داخل شبکه `postgres` است.

## ساخت و اجرا

```powershell
$docker = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe"
$composeArgs = @(
  "compose", "-f", "compose.yaml",
  "-f", "compose.postgres.yaml",
  "--env-file", ".env.docker"
)
& $docker @composeArgs build web
& $docker @composeArgs up -d --force-recreate web
```

## کنترل سلامت

```powershell
& $docker @composeArgs ps
Invoke-RestMethod -Uri "http://127.0.0.1:4000/api/v1/health"
```

خروجی سالم باید `status: ok` و `dataDriver: database` داشته باشد.

## خطاهای رایج

- `ENOTFOUND postgres`: PostgreSQL خاموش یا عضو `shared_postgres` نیست.
- authentication failed: رمز role با `DATABASE_URL` همگام نیست.
- health 500: log وب و PostgreSQL را جداگانه بررسی کنید.
- تغییر کد دیده نمی‌شود: image rebuild نشده است.

فرمان‌های PowerShell را بلوک‌به‌بلوک اجرا کنید؛ `else`، backtick یا `&` جداشده از بلوک قبلی خطای syntax می‌دهد.

## اصل نگهداری

برای production بهتر است PostgreSQL، n8n و برنامه در compose کنترل‌شده با نسخه image مشخص، health dependency، secret manager و backup schedule مدیریت شوند. استفاده از `latest` برای استقرار پایدار توصیه نمی‌شود.

