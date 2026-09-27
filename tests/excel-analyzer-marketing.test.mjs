import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("excel analyzer page has a complete and honest conversion journey",async()=>{
  const page=await read("src/app/services/excel-analyzer/page.tsx");
  const template=await read("src/components/services/shared/DynamicServiceMarketingPage.tsx");
  assert.match(page,/getPublicFaqItems\("\/services\/excel-analyzer"\)/);
  assert.match(page,/<DynamicServiceMarketingPage slug="excel-analyzer" faqItems=\{faqItems\} \/>/);
  assert.match(template,/service\.availability === "available"/);
  assert.match(template,/این سرویس به‌زودی عرضه می‌شود/);
  assert.match(page,/getManagedSeoMetadata\("\/services\/excel-analyzer"\)/);
});

test("excel pilot form persists a qualified lead without uploading a file",async()=>{
  const form=await read("src/components/services/excel-analyzer/ExcelPilotForm.tsx");
  assert.match(form,/fetch\("\/api\/leads"/);
  assert.match(form,/source:\s*"excel-analysis-pilot"/);
  assert.match(form,/need:\s*"درخواست تحلیل آزمایشی اکسل"/);
  for(const name of ["phone","businessName","fileSubject","mainQuestion","sensitiveData","consent"]) assert.match(form,new RegExp(`name="${name}"`));
  assert.doesNotMatch(form,/type="file"|data\.get\("file"\)|formData\.append/);
});

test("excel hero targets pilot and preview instead of claiming instant analysis",async()=>{
  const hero=await read("src/components/services/excel-analyzer/ExcelAnalyzerHero.tsx");
  assert.match(hero,/href="#excel-pilot"/);
  assert.match(hero,/درخواست تحلیل آزمایشی/);
  assert.match(hero,/href="#excel-report-preview"/);
  assert.doesNotMatch(hero,/href="\/login\?service=excel-analyzer"/);
});

test("excel lead source is localized for admins",async()=>{
  const page=await read("src/app/admin/leads/page.tsx");
  assert.match(page,/"excel-analysis-pilot":\s*"تحلیل آزمایشی اکسل"/);
});

test("excel remains coming soon until the real processing engine is connected",async()=>{
  const seed=await read("prisma/seed.ts");
  const config=await read("src/constants/services-config.ts");
  const mock=await read("src/server/repositories/mock/mock-service-catalog-store.ts");
  const seedBlock=seed.match(/id:\s*"excel-analyzer"[\s\S]*?features:\s*\[[\s\S]*?\],\s*\n\s*},/)?.[0];
  const configBlock=config.match(/id:\s*"excel-analyzer"[\s\S]*?features:\s*\[[\s\S]*?\],\s*\n\s*},/)?.[0];
  const mockBlock=mock.match(/id:\s*"excel-analyzer"[\s\S]*?updatedAt:\s*now,\s*\n\s*},/)?.[0];
  assert.match(seedBlock??"",/availability:\s*ServiceAvailability\.COMING_SOON/);
  assert.match(configBlock??"",/availability:\s*"coming-soon"/);
  assert.match(mockBlock??"",/availability:\s*"coming-soon"/);
});
