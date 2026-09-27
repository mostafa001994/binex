"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BookOpenText,
  ImagePlus,
  LoaderCircle,
  Plus,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminSession } from "@/components/admin/admin-gate";
import { BlogRichEditor } from "@/components/admin/blog-rich-editor";
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { hasAdminPermission } from "@/lib/admin-permissions";
import {
  AdminApiError,
  createAdminBlogPostApi,
  createBlogTaxonomyApi,
  deleteAdminBlogPostApi,
  deleteBlogTaxonomyApi,
  getAdminBlogPostsApi,
  getBlogAnalyticsApi,
  getBlogRevisionsApi,
  getBlogTaxonomyApi,
  restoreBlogRevisionApi,
  updateAdminBlogPostApi,
  updateBlogTaxonomyApi,
  type AdminBlogPost,
  type AdminBlogPostInput,
  type AdminPagination,
  type BlogAnalytics,
  type BlogRevision,
  type BlogTaxonomyItem,
} from "@/lib/api-client/admin";

type Draft = AdminBlogPostInput;
const emptyDocument = { type: "doc", content: [{ type: "paragraph" }] };
const emptyDraft: Draft = {
  slug: "",
  title: "",
  excerpt: "",
  contentJson: emptyDocument,
  contentHtml: "<p></p>",
  contentText: "",
  coverImageUrl: "",
  coverImageAlt: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ctaTitle: "",
  ctaDescription: "",
  ctaLabel: "",
  ctaHref: "",
  categoryId: "",
  tagIds: [],
  sources: [],
};
const statusLabel: Record<AdminBlogPost["status"], string> = {
  DRAFT: "پیش‌نویس",
  IN_REVIEW: "در انتظار بازبینی",
  PUBLISHED: "منتشرشده",
  ARCHIVED: "بایگانی",
};

function postToDraft(post: AdminBlogPost): Draft {
  const legacyText = post.contentText || post.contentMarkdown;
  const legacyDocument = {
    type: "doc",
    content: legacyText.split(/\n{2,}/).map((text) => ({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : undefined,
    })),
  };
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    contentJson: post.contentJson ?? legacyDocument,
    contentHtml: post.contentHtml ?? "",
    contentText: legacyText,
    coverImageUrl: post.coverImageUrl ?? "",
    coverImageAlt: post.coverImageAlt ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    ctaTitle: post.ctaTitle ?? "",
    ctaDescription: post.ctaDescription ?? "",
    ctaLabel: post.ctaLabel ?? "",
    ctaHref: post.ctaHref ?? "",
    categoryId: post.category?.id ?? "",
    tagIds: post.tags.map((tag) => tag.id),
    sources: post.sources.map((source) => ({ url: source.url })),
  };
}
function draftSignature(draft: Draft, sourcesText: string, publishAt: string) {
  return JSON.stringify({ draft, sourcesText, publishAt });
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 16);
}

type EditorTab = "content" | "seo" | "cta";
type BlogValidationIssue = { tab: EditorTab; field: string; message: string };
type BlogOperation =
  | "save"
  | "submit"
  | "publish"
  | "schedule"
  | "unpublish"
  | "archive"
  | "reject";

function isValidWebUrl(value: string, allowRelative = false) {
  if (allowRelative && value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AdminBlogPage() {
  const { user } = useAdminSession();
  const canWrite = hasAdminPermission(user.permissions, "admin.content.write");
  const canPublish = hasAdminPermission(user.permissions, "admin.content.publish");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("content");
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [selected, setSelected] = useState<AdminBlogPost | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [sourcesText, setSourcesText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [categories, setCategories] = useState<BlogTaxonomyItem[]>([]);
  const [tags, setTags] = useState<BlogTaxonomyItem[]>([]);
  const [revisions, setRevisions] = useState<BlogRevision[]>([]);
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [lastLocalSavedAt, setLastLocalSavedAt] = useState<Date | null>(null);
  const [supportingLoading, setSupportingLoading] = useState(false);
  const [supportingError, setSupportingError] = useState(false);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [pendingOperation, setPendingOperation] =
    useState<BlogOperation | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [savedSignature, setSavedSignature] = useState(() =>
    draftSignature(emptyDraft, "", ""),
  );
  const currentSignature = useMemo(
    () => draftSignature(draft, sourcesText, publishAt),
    [draft, sourcesText, publishAt],
  );
  const dirty = currentSignature !== savedSignature;
  const readinessChecks = [
    { label: "عنوان و خلاصه", ready: Boolean(draft.title && draft.excerpt) },
    {
      label: "محتوای کافی",
      ready: Boolean(draft.contentText.trim().length >= 200),
    },
    {
      label: "دسته‌بندی",
      ready: Boolean(draft.categoryId),
    },
    {
      label: "تصویر شاخص و Alt",
      ready: Boolean(draft.coverImageUrl && draft.coverImageAlt),
    },
    {
      label: "SEO",
      ready: Boolean(draft.seoTitle && draft.seoDescription),
    },
  ];

  const refreshPosts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const result = await getAdminBlogPostsApi({ search, status, page });
        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (error) {
        toast.error("دریافت مقاله‌ها انجام نشد", {
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [search, status],
  );
  const refreshAssets = useCallback(async () => {
    try {
      const taxonomy = await getBlogTaxonomyApi();
      setCategories(taxonomy.categories);
      setTags(taxonomy.tags);
    } catch (error) {
      toast.error("دریافت تنظیمات وبلاگ انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void refreshPosts(), 350);
    return () => window.clearTimeout(timer);
  }, [refreshPosts]);
  useEffect(() => {
    void refreshAssets();
  }, [refreshAssets]);
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(
      () => {
        localStorage.setItem(
          `binix-blog-draft:${user.id}:${selected?.id ?? "new"}`,
          JSON.stringify({
            draft,
            sourcesText,
            publishAt,
            version: selected?.version ?? null,
            savedAt: new Date().toISOString(),
          }),
        );
        setLastLocalSavedAt(new Date());
      },
      800,
    );
    return () => window.clearTimeout(timer);
  }, [dirty, draft, sourcesText, publishAt, selected?.id, selected?.version, user.id]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function startNew() {
    if (dirty && !window.confirm("تغییرات ذخیره‌نشده کنار گذاشته شود؟")) return;
    const localKey = `binix-blog-draft:${user.id}:new`;
    const local = localStorage.getItem(localKey);
    setSelected(null);
    setDraft(emptyDraft);
    setSourcesText("");
    setRevisions([]);
    setAnalytics(null);
    setPublishAt("");
    setLastLocalSavedAt(null);
    setConflictDetected(false);
    setReviewNote("");
    setSavedSignature(draftSignature(emptyDraft, "", ""));
    setEditorTab("content");
    setEditorOpen(true);
    if (local) {
      try {
        const recovered = JSON.parse(local) as {
          draft: Draft;
          sourcesText: string;
          publishAt: string;
          version: number | null;
        };
        if (
          recovered.version === null &&
          window.confirm("یک پیش‌نویس محلی ذخیره‌نشده پیدا شد؛ بازیابی شود؟")
        ) {
          setDraft(recovered.draft);
          setSourcesText(recovered.sourcesText);
          setPublishAt(recovered.publishAt);
        }
      } catch {
        localStorage.removeItem(localKey);
      }
    }
  }
  async function edit(post: AdminBlogPost, force = false) {
    if (
      !force &&
      dirty &&
      !window.confirm("تغییرات ذخیره‌نشده کنار گذاشته شود؟")
    )
      return;
    const serverDraft = postToDraft(post);
    const serverSources = post.sources.map((source) => source.url).join("\n");
    const serverPublishAt =
      post.scheduled && post.publishedAt
        ? toLocalDateTimeInput(post.publishedAt)
        : "";
    setSelected(post);
    setDraft(serverDraft);
    setSourcesText(serverSources);
    setPublishAt(serverPublishAt);
    setSavedSignature(
      draftSignature(serverDraft, serverSources, serverPublishAt),
    );
    setEditorTab("content");
    setEditorOpen(true);
    setLastLocalSavedAt(null);
    setConflictDetected(false);
    setReviewNote("");
    const localKey = `binix-blog-draft:${user.id}:${post.id}`;
    const local = localStorage.getItem(localKey);
    if (local) {
      try {
        const recovered = JSON.parse(local) as {
          draft: Draft;
          sourcesText: string;
          publishAt: string;
          version: number;
        };
        if (
          recovered.version === post.version &&
          window.confirm("یک نسخه محلی ذخیره‌نشده پیدا شد؛ بازیابی شود؟")
        ) {
          setDraft(recovered.draft);
          setSourcesText(recovered.sourcesText);
          setPublishAt(recovered.publishAt);
        } else if (recovered.version !== post.version) {
          localStorage.removeItem(localKey);
        }
      } catch {
        localStorage.removeItem(localKey);
      }
    }
    setRevisions([]);
    setAnalytics(null);
    setSupportingError(false);
    setSupportingLoading(true);
    const [revisionResult, analyticsResult] = await Promise.allSettled([
      getBlogRevisionsApi(post.id),
      getBlogAnalyticsApi(post.id),
    ]);
    setRevisions(
      revisionResult.status === "fulfilled"
        ? revisionResult.value.revisions
        : [],
    );
    setAnalytics(
      analyticsResult.status === "fulfilled" ? analyticsResult.value : null,
    );
    setSupportingError(
      revisionResult.status === "rejected" || analyticsResult.status === "rejected",
    );
    setSupportingLoading(false);
  }
  function payload(): Draft {
    return {
      ...draft,
      sources: sourcesText
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => ({ url })),
    };
  }

  function validate(operation: BlogOperation) {
    if (operation === "unpublish" || operation === "archive" || operation === "reject") return true;
    const issues: BlogValidationIssue[] = [];
    const textLength = draft.contentText.trim().length;
    if (draft.title.trim().length < 3)
      issues.push({ tab: "content", field: "title", message: "عنوان مقاله باید حداقل ۳ کاراکتر باشد." });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug.trim()))
      issues.push({ tab: "content", field: "slug", message: "نامک باید انگلیسی و شامل حروف کوچک، عدد یا خط تیره باشد." });
    const requiresReviewReadiness = operation !== "save";
    if (requiresReviewReadiness && draft.excerpt.trim().length < 20)
      issues.push({ tab: "content", field: "excerpt", message: "برای ادامه، خلاصه مقاله باید حداقل ۲۰ کاراکتر باشد." });
    if (requiresReviewReadiness && textLength < 50)
      issues.push({ tab: "content", field: "content", message: "برای ادامه، محتوا باید حداقل ۵۰ کاراکتر باشد." });

    const requiresPublishReadiness =
      operation === "publish" || operation === "schedule" ||
      (operation === "save" && selected?.status === "PUBLISHED");
    if (requiresPublishReadiness) {
      if (textLength < 200)
        issues.push({ tab: "content", field: "content", message: "برای انتشار، محتوای مقاله باید حداقل ۲۰۰ کاراکتر باشد." });
      if (!draft.categoryId)
        issues.push({ tab: "content", field: "category", message: "برای انتشار، دسته‌بندی مقاله را انتخاب کنید." });
      if (!draft.coverImageUrl.trim())
        issues.push({ tab: "content", field: "cover", message: "برای انتشار، تصویر شاخص را انتخاب کنید." });
      if (!draft.coverImageAlt.trim())
        issues.push({ tab: "content", field: "cover-alt", message: "برای انتشار، Alt تصویر شاخص را بنویسید." });
    }
    if (operation === "schedule") {
      const scheduledAt = new Date(publishAt);
      if (!publishAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now())
        issues.push({ tab: "content", field: "publish-at", message: "زمان انتشار باید تاریخی معتبر در آینده باشد." });
    }
    const sources = sourcesText.split("\n").map((value) => value.trim()).filter(Boolean);
    if (sources.some((value) => !isValidWebUrl(value)))
      issues.push({ tab: "seo", field: "sources", message: "هر منبع باید یک آدرس کامل http یا https باشد." });
    if (draft.canonicalUrl.trim() && !isValidWebUrl(draft.canonicalUrl.trim()))
      issues.push({ tab: "seo", field: "canonical", message: "Canonical باید یک آدرس کامل و معتبر باشد." });
    const ctaValues = [draft.ctaTitle, draft.ctaLabel, draft.ctaHref].map((value) => value.trim());
    if (ctaValues.some(Boolean) && ctaValues.some((value) => !value))
      issues.push({ tab: "cta", field: "cta", message: "عنوان، متن دکمه و لینک CTA را با هم کامل کنید." });
    if (draft.ctaHref.trim() && !isValidWebUrl(draft.ctaHref.trim(), true))
      issues.push({ tab: "cta", field: "cta-href", message: "لینک CTA باید مسیر داخلی یا آدرس کامل معتبر باشد." });
    if (!issues.length) return true;
    const first = issues[0];
    setEditorTab(first.tab);
    toast.error(first.message, {
      description: issues.length > 1 ? `${(issues.length - 1).toLocaleString("fa-IR")} مورد دیگر نیز نیازمند اصلاح است.` : undefined,
    });
    window.setTimeout(() => {
      const element = document.querySelector<HTMLElement>(`[data-blog-field="${first.field}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus();
    }, 50);
    return false;
  }
  async function save(
    operation: BlogOperation = "save",
  ) {
    if (!validate(operation)) return;
    setSaving(true);
    try {
      const previousId = selected?.id;
      const result = selected
        ? await updateAdminBlogPostApi(selected.id, {
            ...payload(),
            version: selected.version,
            operation,
            publishAt: publishAt
              ? new Date(publishAt).toISOString()
              : undefined,
            reviewNote: operation === "reject" ? reviewNote : undefined,
          })
        : await createAdminBlogPostApi({
            ...payload(),
            operation: operation as "save" | "submit" | "publish" | "schedule",
            publishAt: publishAt
              ? new Date(publishAt).toISOString()
              : undefined,
          });
      if (previousId) localStorage.removeItem(`binix-blog-draft:${user.id}:${previousId}`);
      else localStorage.removeItem(`binix-blog-draft:${user.id}:new`);
      setLastLocalSavedAt(null);
      setConflictDetected(false);
      toast.success(
        operation === "schedule"
          ? "انتشار زمان‌بندی شد"
          : selected
            ? "مقاله بروزرسانی شد"
            : "پیش‌نویس ساخته شد",
      );
      await edit(result.post, true);
      await refreshPosts(pagination.page);
    } catch (error) {
      if (error instanceof Error && error.message.includes("هم‌زمان"))
        setConflictDetected(true);
      toast.error("عملیات مقاله انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }
  async function removePost() {
    if (!selected || !window.confirm("مقاله بایگانی‌شده برای همیشه حذف شود؟"))
      return;
    try {
      await deleteAdminBlogPostApi(selected.id, selected.version);
      localStorage.removeItem(`binix-blog-draft:${user.id}:${selected.id}`);
      toast.success("مقاله حذف شد");
      setSelected(null);
      setDraft(emptyDraft);
      setSourcesText("");
      setRevisions([]);
      setAnalytics(null);
      setPublishAt("");
      setSavedSignature(draftSignature(emptyDraft, "", ""));
      await refreshPosts();
    } catch (error) {
      toast.error("حذف مقاله انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }
  async function restore(revision: BlogRevision) {
    if (
      !selected ||
      !window.confirm(
        `نسخه «${revision.title}» بازیابی شود؟ نسخه فعلی نیز حفظ خواهد شد.`,
      )
    )
      return;
    try {
      const result = await restoreBlogRevisionApi(
        selected.id,
        revision.id,
        selected.version,
      );
      localStorage.removeItem(`binix-blog-draft:${user.id}:${selected.id}`);
      toast.success("نسخه قبلی به‌صورت پیش‌نویس بازیابی شد");
      await edit(result.post, true);
      await refreshPosts(pagination.page);
    } catch (error) {
      toast.error("بازیابی نسخه انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }
  async function createTaxonomy(input: {
    kind: "category" | "tag";
    name: string;
    slug: string;
    description?: string;
  }) {
    await createBlogTaxonomyApi(input);
    await refreshAssets();
    toast.success(input.kind === "category" ? "دسته ساخته شد" : "برچسب ساخته شد");
  }
  async function removeTaxonomy(kind: "category" | "tag", id: string, replacementId?: string) {
    try {
      await deleteBlogTaxonomyApi(kind, id, replacementId);
      await refreshAssets();
      toast.success(replacementId ? "انتقال و ادغام انجام شد" : "مورد حذف شد");
    } catch (error) {
      toast.error("حذف انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }
  async function changeTaxonomy(input: { kind: "category" | "tag"; id: string; name: string; slug: string; description?: string }) {
    try {
      await updateBlogTaxonomyApi(input);
      await refreshAssets();
      toast.success("اطلاعات بروزرسانی شد");
      return true;
    } catch (error) {
      toast.error("ویرایش انجام نشد", { description: error instanceof Error ? error.message : undefined });
      return false;
    }
  }
  return (
    <div data-admin-form-root className="space-y-6">
      <AdminPageHeader
        title={
          editorOpen
            ? selected
              ? "ویرایش مقاله"
              : "مقاله جدید"
            : "مدیریت وبلاگ"
        }
        description={
          editorOpen
            ? dirty
              ? "تغییرات این مقاله هنوز روی سرور ذخیره نشده‌اند."
              : "همه تغییرات مقاله ذخیره شده‌اند."
            : "مقاله‌ها را پیدا، مدیریت و برای انتشار آماده کنید."
        }
        actions={
          editorOpen ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  if (
                    dirty &&
                    !window.confirm(
                      "بدون ذخیره روی سرور به فهرست مقاله‌ها برگردیم؟",
                    )
                  )
                    return;
                  setEditorOpen(false);
                }}
              >
                <ArrowRight size={15} /> بازگشت به مقاله‌ها
              </Button>
              {selected ? (
                <Button
                  variant="secondary"
                  disabled={dirty}
                  title={
                    dirty
                      ? "برای دیدن پیش‌نمایش دقیق، ابتدا تغییرات را ذخیره کنید."
                      : undefined
                  }
                  onClick={() =>
                    window.open(
                      `/admin/blog/preview/${selected.id}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  {dirty ? "ابتدا ذخیره کنید" : "پیش‌نمایش"}
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <ButtonLink
                href="/admin/media"
                variant="secondary"
                leadingIcon={<ImagePlus size={15} />}
              >
                کتابخانه رسانه
              </ButtonLink>
              {canWrite ? (
                <Button onClick={startNew}>
                  <Plus size={15} /> مقاله جدید
                </Button>
              ) : null}
            </>
          )
        }
      />
      {!editorOpen ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <Card className="p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold">مقاله‌ها</h2>
              <p className="text-foreground-muted mt-1 text-xs">
                برای ویرایش، روی مقاله کلیک کنید.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block flex-1">
                <Search
                  className="text-foreground-subtle absolute top-3 right-3"
                  size={15}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جست‌وجو در عنوان، نامک یا محتوا"
                  className="rounded-control border-border bg-background h-10 w-full border pr-9 pl-3 text-sm outline-none"
                />
              </label>
              <select
                aria-label="وضعیت"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-control border-border bg-background border px-2 text-xs"
              >
                <option value="">همه</option>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="text-foreground-muted p-4 text-sm">
                  در حال دریافت...
                </p>
              ) : null}
              {!loading && !posts.length ? (
                <p className="text-foreground-muted p-4 text-sm">
                  مقاله‌ای پیدا نشد.
                </p>
              ) : null}
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => void edit(post)}
                  className="rounded-control border-border hover:border-primary/50 hover:bg-surface-hover grid w-full gap-3 border p-3 text-right transition sm:grid-cols-[minmax(0,1fr)_140px_150px] sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="border-border bg-surface-hover flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.coverImageAlt || post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpenText
                          size={18}
                          className="text-foreground-subtle"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-sm font-bold">
                        {post.title}
                      </div>
                      <div
                        dir="ltr"
                        className="text-foreground-subtle mt-1 truncate text-left text-[11px]"
                      >
                        /blog/{post.slug}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center sm:justify-center">
                    <Badge>
                      {post.scheduled
                        ? "زمان‌بندی‌شده"
                        : statusLabel[post.status]}
                    </Badge>
                  </div>
                  <div className="text-foreground-muted text-xs sm:text-left">
                    <div>{post.author.name || post.author.phone}</div>
                    <div className="text-foreground-subtle mt-1 text-[11px]">
                      {new Date(post.updatedAt).toLocaleDateString("fa-IR")} ·{" "}
                      {post._count.revisions.toLocaleString("fa-IR")} نسخه
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {pagination.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => void refreshPosts(pagination.page - 1)}
                >
                  قبلی
                </button>
                <span>
                  {pagination.page}/{pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => void refreshPosts(pagination.page + 1)}
                >
                  بعدی
                </button>
              </div>
            ) : null}
          </Card>
          {canWrite ? <TaxonomyPanel
            categories={categories}
            tags={tags}
            create={createTaxonomy}
            remove={removeTaxonomy}
            update={changeTaxonomy}
            canDelete={canPublish}
          /> : null}
        </div>
      ) : (
        <div className="space-y-5">
          <div
            role="tablist"
            aria-label="بخش‌های ویرایش مقاله"
            className="rounded-control border-border bg-surface flex flex-wrap gap-1 border p-1"
          >
            {(
              [
                ["content", "محتوا و تصویر"],
                ["seo", "SEO و منابع"],
                ["cta", "دعوت به اقدام"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={editorTab === value}
                onClick={() => setEditorTab(value)}
                className={`rounded-control min-h-10 px-4 text-sm font-semibold transition ${editorTab === value ? "bg-primary text-white" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <fieldset disabled={!canWrite} className="contents">
          <Card className="p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-control bg-primary/10 text-primary flex size-10 items-center justify-center">
                <BookOpenText size={18} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">
                  {selected ? "ویرایش مقاله" : "مقاله جدید"}
                </h2>
                <p className="text-foreground-muted text-xs">
                  {dirty
                    ? lastLocalSavedAt
                      ? `نسخه محلی ساعت ${lastLocalSavedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })} ذخیره شد؛ هنوز روی سرور نیست`
                      : "در حال آماده‌سازی ذخیره محلی؛ تغییرات هنوز روی سرور نیست"
                    : "همه تغییرات ذخیره شده‌اند"}
                </p>
              </div>
            </div>
            <div className="border-border bg-surface-hover mb-6 grid gap-2 rounded-lg border p-3 sm:grid-cols-2 xl:grid-cols-5">
              {readinessChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex min-h-10 items-center justify-between gap-2 px-2 text-xs"
                >
                  <span>{check.label}</span>
                  <Badge variant={check.ready ? "success" : "warning"}>
                    {check.ready ? "کامل" : "نیازمند تکمیل"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {editorTab === "content" ? (
                <>
                  <Field label="عنوان">
                    <input
                      required
                      minLength={3}
                      data-field-label="عنوان مقاله"
                      data-blog-field="title"
                      value={draft.title}
                      onChange={(e) =>
                        setDraft({ ...draft, title: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="نامک انگلیسی">
                    <input
                      dir="ltr"
                      required
                      data-field-label="نامک انگلیسی"
                      data-blog-field="slug"
                      value={draft.slug}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                    />
                  </Field>
                  <Field label="خلاصه" wide>
                    <textarea
                      required
                      minLength={20}
                      data-field-label="خلاصه مقاله"
                      data-blog-field="excerpt"
                      rows={3}
                      value={draft.excerpt}
                      onChange={(e) =>
                        setDraft({ ...draft, excerpt: e.target.value })
                      }
                    />
                  </Field>
                  <div className="border-border bg-surface-hover grid gap-4 rounded-lg border p-4 sm:col-span-2 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
                    <label className="text-foreground-muted block text-xs font-semibold">
                      دسته‌بندی مقاله
                      <select
                        data-blog-field="category"
                        value={draft.categoryId}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            categoryId: event.target.value,
                          })
                        }
                        className="rounded-control border-border bg-background mt-2 h-11 w-full border px-3 text-sm"
                      >
                        <option value="">بدون دسته‌بندی</option>
                        {categories.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-foreground-subtle mt-2 block font-normal">
                        برای هر مقاله یک دسته اصلی انتخاب کنید.
                      </span>
                    </label>
                    <div className="min-w-0">
                      <div className="text-foreground-muted flex items-center justify-between gap-2 text-xs font-semibold">
                        <label htmlFor="blog-tag-picker">انتخاب برچسب</label>
                        <span className="text-foreground-subtle font-normal">
                          {draft.tagIds.length.toLocaleString("fa-IR")} انتخاب
                          شده
                        </span>
                      </div>
                      <select
                        id="blog-tag-picker"
                        value=""
                        disabled={
                          !tags.some((tag) => !draft.tagIds.includes(tag.id))
                        }
                        onChange={(event) => {
                          const tagId = event.target.value;
                          if (!tagId || draft.tagIds.includes(tagId)) return;
                          setDraft({
                            ...draft,
                            tagIds: [...draft.tagIds, tagId],
                          });
                        }}
                        className="rounded-control border-border bg-background mt-2 h-11 w-full border px-3 text-sm disabled:opacity-60"
                      >
                        <option value="">
                          {tags.length
                            ? "یک برچسب را انتخاب کنید…"
                            : "هنوز برچسبی ساخته نشده است"}
                        </option>
                        {tags
                          .filter((tag) => !draft.tagIds.includes(tag.id))
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                      </select>
                      <div className="mt-3 flex min-h-8 flex-wrap gap-2">
                        {draft.tagIds.map((tagId) => {
                          const tag = tags.find((item) => item.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tag.id}
                              className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full border py-1 pr-3 pl-1 text-xs font-semibold"
                            >
                              {tag.name}
                              <button
                                type="button"
                                aria-label={`حذف برچسب ${tag.name}`}
                                onClick={() =>
                                  setDraft({
                                    ...draft,
                                    tagIds: draft.tagIds.filter(
                                      (id) => id !== tag.id,
                                    ),
                                  })
                                }
                                className="hover:bg-primary/15 inline-flex size-7 items-center justify-center rounded-full transition"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2" data-blog-field="content" tabIndex={-1}>
                    <div className="text-foreground-muted mb-2 text-xs font-semibold">
                      محتوای مقاله
                    </div>
                    <BlogRichEditor
                      key={`${selected?.id ?? "new"}-${revisions.length}`}
                      value={draft.contentJson}
                      fallbackHtml={draft.contentHtml}
                      onChange={(content) =>
                        setDraft((current) => ({ ...current, ...content }))
                      }
                    />
                    <p className="text-foreground-subtle mt-2 text-xs">
                      برای قراردادن تصویر بین پاراگراف‌ها، نشانگر را در محل
                      موردنظر بگذارید و «افزودن تصویر» را از نوار ادیتور بزنید.
                    </p>
                  </div>
                </>
              ) : null}
              {editorTab === "seo" ? (
                <>
                  <Field label="عنوان SEO">
                    <input
                      value={draft.seoTitle}
                      maxLength={70}
                      onChange={(e) =>
                        setDraft({ ...draft, seoTitle: e.target.value })
                      }
                    />
                    <Count value={draft.seoTitle} max={70} />
                  </Field>
                  <Field label="توضیح SEO">
                    <textarea
                      rows={2}
                      value={draft.seoDescription}
                      maxLength={170}
                      onChange={(e) =>
                        setDraft({ ...draft, seoDescription: e.target.value })
                      }
                    />
                    <Count value={draft.seoDescription} max={170} />
                  </Field>
                </>
              ) : null}
              {editorTab === "content" ? (
                <div className="sm:col-span-2">
                  <div className="text-foreground-muted mb-2 text-xs font-semibold">
                    تصویر شاخص مقاله
                  </div>
                  <div className="rounded-card border-border bg-surface-hover grid gap-4 border p-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="border-border bg-background rounded-control flex aspect-video items-center justify-center overflow-hidden border">
                      {draft.coverImageUrl ? (
                        <img
                          src={draft.coverImageUrl}
                          alt={draft.coverImageAlt || "پیش‌نمایش تصویر شاخص"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-foreground-subtle flex flex-col items-center gap-2 text-xs">
                          <ImagePlus size={26} /> بدون تصویر شاخص
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setCoverPickerOpen(true)}
                          data-blog-field="cover"
                        >
                          <ImagePlus size={15} />
                          {draft.coverImageUrl
                            ? "تغییر تصویر شاخص"
                            : "انتخاب تصویر شاخص"}
                        </Button>
                        {draft.coverImageUrl ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                coverImageUrl: "",
                                coverImageAlt: "",
                              })
                            }
                          >
                            <Trash2 size={14} /> حذف تصویر
                          </Button>
                        ) : null}
                      </div>
                      <label className="text-foreground-muted block text-xs font-semibold">
                        متن جایگزین تصویر (Alt)
                        <input
                          data-blog-field="cover-alt"
                          value={draft.coverImageAlt}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              coverImageAlt: event.target.value,
                            })
                          }
                          className="rounded-control border-border bg-background mt-2 h-11 w-full border px-3 text-sm"
                          placeholder="توصیف کوتاه و دقیق تصویر"
                        />
                      </label>
                      <details className="text-xs">
                        <summary className="text-primary cursor-pointer">
                          واردکردن آدرس تصویر به‌صورت دستی
                        </summary>
                        <input
                          dir="ltr"
                          value={draft.coverImageUrl}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              coverImageUrl: event.target.value,
                            })
                          }
                          className="rounded-control border-border bg-background mt-2 h-10 w-full border px-3"
                          placeholder="https://..."
                        />
                      </details>
                    </div>
                  </div>
                </div>
              ) : null}
              {editorTab === "seo" ? (
                <>
                  <Field label="Canonical URL">
                    <input
                      data-blog-field="canonical"
                      dir="ltr"
                      value={draft.canonicalUrl}
                      onChange={(e) =>
                        setDraft({ ...draft, canonicalUrl: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="منابع؛ هر URL در یک خط">
                    <textarea
                      data-blog-field="sources"
                      dir="ltr"
                      rows={4}
                      value={sourcesText}
                      onChange={(e) => setSourcesText(e.target.value)}
                    />
                  </Field>
                </>
              ) : null}
              {editorTab === "cta" ? (
                <>
                  <Field label="عنوان CTA">
                    <input
                      data-blog-field="cta"
                      value={draft.ctaTitle}
                      maxLength={160}
                      onChange={(e) =>
                        setDraft({ ...draft, ctaTitle: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="متن دکمه CTA">
                    <input
                      value={draft.ctaLabel}
                      maxLength={80}
                      onChange={(e) =>
                        setDraft({ ...draft, ctaLabel: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="توضیح CTA" wide>
                    <textarea
                      rows={2}
                      value={draft.ctaDescription}
                      maxLength={500}
                      onChange={(e) =>
                        setDraft({ ...draft, ctaDescription: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="لینک CTA" wide>
                    <input
                      data-blog-field="cta-href"
                      dir="ltr"
                      value={draft.ctaHref}
                      onChange={(e) =>
                        setDraft({ ...draft, ctaHref: e.target.value })
                      }
                      placeholder="/consultation یا https://..."
                    />
                  </Field>
                </>
              ) : null}
            </div>
            <div className="rounded-card border-border bg-surface/95 sticky bottom-4 z-20 mt-7 flex flex-wrap gap-2 border p-3 shadow-lg backdrop-blur-xl">
              <Button disabled={saving || !dirty} onClick={() => void save("save")}>
                {saving
                  ? "در حال ذخیره..."
                  : selected
                    ? "ذخیره تغییرات"
                    : "ساخت پیش‌نویس"}
              </Button>
              {(!selected || selected.status !== "PUBLISHED") ? (
                <Button variant="secondary" onClick={() => void save("submit")}> 
                  ارسال برای بازبینی
                </Button>
              ) : null}
              {canPublish &&
              !selected?.scheduled &&
              selected?.status !== "PUBLISHED" ? (
                <Button
                  variant="secondary"
                  onClick={() => setPendingOperation("publish")}
                >
                  انتشار فوری
                </Button>
              ) : null}
              {canPublish ? (
                <>
                  <input
                    data-blog-field="publish-at"
                    type="datetime-local"
                    value={publishAt}
                    onChange={(e) => setPublishAt(e.target.value)}
                    className="rounded-control border-border bg-background border px-3 text-xs"
                  />
                  <Button
                    variant="secondary"
                    disabled={!publishAt}
                    onClick={() => setPendingOperation("schedule")}
                  >
                    زمان‌بندی
                  </Button>
                </>
              ) : null}
              {canPublish && selected?.status === "PUBLISHED" ? (
                <Button
                  variant="secondary"
                  onClick={() => setPendingOperation("unpublish")}
                >
                  لغو انتشار
                </Button>
              ) : null}
              {canPublish && selected && selected.status !== "ARCHIVED" ? (
                <Button
                  variant="secondary"
                  onClick={() => setPendingOperation("archive")}
                >
                  بایگانی
                </Button>
              ) : null}
              {canPublish && selected?.status === "IN_REVIEW" ? (
                <Button
                  variant="secondary"
                  disabled={reviewNote.trim().length < 5}
                  onClick={() => setPendingOperation("reject")}
                >
                  بازگرداندن برای اصلاح
                </Button>
              ) : null}
              {canPublish && selected?.status === "ARCHIVED" ? (
                <Button variant="secondary" onClick={() => void removePost()}>
                  <Trash2 size={14} /> حذف دائمی
                </Button>
              ) : null}
            </div>
          </Card>
          </fieldset>
          {selected?.reviewNote ? (
            <Card className="border-warning/30 p-5">
              <h3 className="font-bold text-warning">یادداشت آخرین بازبینی</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{selected.reviewNote}</p>
              {selected.reviewer ? <p className="mt-2 text-xs text-foreground-subtle">بازبین: {selected.reviewer.name || selected.reviewer.phone}</p> : null}
            </Card>
          ) : null}
          {canPublish && selected?.status === "IN_REVIEW" ? (
            <Card className="p-5">
              <label className="text-sm font-semibold">
                دلیل بازگرداندن برای اصلاح
                <textarea value={reviewNote} maxLength={1000} onChange={(event) => setReviewNote(event.target.value)} className="rounded-control border-border mt-2 min-h-24 w-full border p-3 text-sm" placeholder="نکات دقیق بازبینی را برای نویسنده بنویسید…" />
              </label>
            </Card>
          ) : null}
          {selected && analytics ? (
            <Card className="p-5">
              <h3 className="font-bold">
                آمار {analytics.days.toLocaleString("fa-IR")} روز اخیر
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric
                  label="بازدید یکتا"
                  value={analytics.summary.uniqueViews}
                />
                <Metric
                  label="کلیک CTA"
                  value={analytics.summary.uniqueCtaClicks}
                />
                <Metric
                  label="نرخ کلیک"
                  value={`${analytics.summary.ctaRate.toLocaleString("fa-IR")}%`}
                />
                <Metric label="روزهای ثبت‌شده" value={analytics.daily.length} />
              </div>
            </Card>
          ) : null}
          {selected && supportingLoading ? (
            <Card className="p-5 text-sm text-foreground-muted">
              در حال دریافت آمار و تاریخچه نسخه‌ها…
            </Card>
          ) : null}
          {selected && supportingError ? (
            <Card className="border-warning/30 p-5">
              <p className="text-sm text-warning">
                دریافت بخشی از آمار یا تاریخچه نسخه‌ها انجام نشد.
              </p>
              <Button className="mt-3" variant="secondary" onClick={() => void edit(selected, true)}>
                تلاش مجدد
              </Button>
            </Card>
          ) : null}
          {selected && conflictDetected ? (
            <Card className="border-warning/30 p-5">
              <p className="text-sm font-semibold text-warning">
                نسخه سرور توسط فرد دیگری تغییر کرده است. نسخه محلی شما حفظ شده؛ ابتدا نسخه تازه سرور را بررسی کنید.
              </p>
              <Button className="mt-3" variant="secondary" onClick={() => void edit(selected, true)}>
                دریافت نسخه تازه سرور
              </Button>
            </Card>
          ) : null}
          {selected ? (
            <Card className="p-5">
              <h3 className="font-bold">تاریخچه نسخه‌ها</h3>
              <div className="mt-4 space-y-2">
                {!revisions.length ? (
                  <p className="text-foreground-muted text-sm">
                    نسخه قبلی هنوز وجود ندارد.
                  </p>
                ) : (
                  revisions.map((item) => {
                    const delta = wordDelta(
                      item.contentText || "",
                      draft.contentText,
                    );
                    return (
                      <div
                        key={item.id}
                        className="rounded-control border-border border p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">
                              {item.title}
                            </div>
                            <div className="text-foreground-subtle mt-1 text-[11px]">
                              {new Date(item.createdAt).toLocaleString("fa-IR")}{" "}
                              · {item.editor.name || item.editor.phone}
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => void restore(item)}
                          >
                            <RotateCcw size={14} /> بازیابی
                          </Button>
                        </div>
                        <details className="mt-3 text-xs">
                          <summary className="text-primary cursor-pointer">
                            مشاهده تفاوت و محتوای نسخه
                          </summary>
                          <p className="text-foreground-muted mt-2">
                            نسبت به متن فعلی:{" "}
                            {delta.added.toLocaleString("fa-IR")} واژه افزوده و{" "}
                            {delta.removed.toLocaleString("fa-IR")} واژه حذف شده
                          </p>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                              <div className="mb-1 font-semibold">نسخه انتخابی</div>
                              <div className="bg-surface-hover max-h-52 overflow-auto rounded p-3 leading-6 whitespace-pre-wrap">
                                {item.contentText || item.excerpt}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 font-semibold">نسخه فعلی</div>
                              <div className="bg-surface-hover max-h-52 overflow-auto rounded p-3 leading-6 whitespace-pre-wrap">
                                {draft.contentText || draft.excerpt}
                              </div>
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          ) : null}
        </div>
      )}
      <MediaPickerDialog
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        selectedUrl={draft.coverImageUrl}
        title="انتخاب تصویر شاخص مقاله"
        onSelect={(item) => {
          setDraft((current) => ({
            ...current,
            coverImageUrl: item.url,
            coverImageAlt: item.altText || current.coverImageAlt,
          }));
        }}
      />
      <ConfirmDialog
        open={pendingOperation !== null}
        onClose={() => setPendingOperation(null)}
        onConfirm={() => {
          const operation = pendingOperation;
          setPendingOperation(null);
          if (operation) void save(operation);
        }}
        title={
          pendingOperation === "publish"
            ? "انتشار فوری مقاله"
            : pendingOperation === "schedule"
              ? "زمان‌بندی انتشار"
              : pendingOperation === "unpublish"
                ? "لغو انتشار مقاله"
                : pendingOperation === "reject"
                  ? "بازگرداندن مقاله برای اصلاح"
                : "بایگانی مقاله"
        }
        description="وضعیت عمومی مقاله تغییر می‌کند. پیش از ادامه، محتوا و زمان انتشار را بررسی کنید."
        consequences={[
          pendingOperation === "publish"
            ? "مقاله بلافاصله در وبلاگ عمومی قابل مشاهده می‌شود."
            : pendingOperation === "schedule"
              ? "مقاله در زمان انتخاب‌شده به‌صورت خودکار نمایش داده می‌شود."
              : pendingOperation === "unpublish"
                ? "صفحه عمومی مقاله از دسترس خارج می‌شود."
                : pendingOperation === "reject"
                  ? "مقاله به پیش‌نویس برمی‌گردد و دلیل بازبینی برای نویسنده ثبت می‌شود."
                : "مقاله از گردش فعال محتوا خارج می‌شود.",
        ]}
        confirmLabel="تأیید و ادامه"
        tone="warning"
      />
    </div>
  );
}

const TAXONOMY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeTaxonomySlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function TaxonomyPanel({
  categories,
  tags,
  create,
  remove,
  update,
  canDelete,
}: {
  categories: BlogTaxonomyItem[];
  tags: BlogTaxonomyItem[];
  create: (input: { kind: "category" | "tag"; name: string; slug: string; description?: string }) => Promise<void>;
  remove: (kind: "category" | "tag", id: string, replacementId?: string) => Promise<void>;
  update: (input: { kind: "category" | "tag"; id: string; name: string; slug: string; description?: string }) => Promise<boolean>;
  canDelete: boolean;
}) {
  const [kind, setKind] = useState<"category" | "tag">("category");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [creating, setCreating] = useState(false);
  const [touched, setTouched] = useState({ name: false, slug: false, description: false });
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const items = kind === "category" ? categories : tags;
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BlogTaxonomyItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogTaxonomyItem | null>(null);
  const [replacementId, setReplacementId] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const normalizedName = name.trim();
  const duplicateName = items.some(
    (item) => item.name.trim().toLocaleLowerCase("fa") === normalizedName.toLocaleLowerCase("fa"),
  );
  const duplicateSlug = items.some((item) => item.slug === slug);
  const nameError = serverErrors.name || (touched.name && normalizedName.length < 2
    ? "نام باید حداقل ۲ کاراکتر باشد."
    : duplicateName
      ? "این نام قبلاً استفاده شده است."
      : "");
  const slugError = serverErrors.slug || (touched.slug && slug.length < 2
    ? "نامک باید حداقل ۲ کاراکتر باشد."
    : slug && !TAXONOMY_SLUG_PATTERN.test(slug)
      ? "فقط حروف کوچک انگلیسی، عدد و خط تیره مجاز است."
      : duplicateSlug
        ? "این نامک قبلاً استفاده شده است."
        : "");
  const descriptionError = serverErrors.description || (description.length > 500
    ? "توضیح نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد."
    : "");
  const formValid = normalizedName.length >= 2 && normalizedName.length <= 120 &&
    slug.length >= 2 && slug.length <= 120 && TAXONOMY_SLUG_PATTERN.test(slug) &&
    !duplicateName && !duplicateSlug && !descriptionError;
  const editDuplicateName = editing ? items.some(
    (item) => item.id !== editing.id && item.name.trim().toLocaleLowerCase("fa") === editName.trim().toLocaleLowerCase("fa"),
  ) : false;
  const editDuplicateSlug = editing ? items.some(
    (item) => item.id !== editing.id && item.slug === editSlug,
  ) : false;
  const editValid = editName.trim().length >= 2 && editName.trim().length <= 120 &&
    editSlug.length >= 2 && editSlug.length <= 120 && TAXONOMY_SLUG_PATTERN.test(editSlug) &&
    editDescription.length <= 500 && !editDuplicateName && !editDuplicateSlug;
  const filtered = items.filter((item) =>
    `${item.name} ${item.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function resetCreateForm(nextKind = kind) {
    setKind(nextKind);
    setName("");
    setSlug("");
    setDescription("");
    setSlugEdited(false);
    setTouched({ name: false, slug: false, description: false });
    setServerErrors({});
    setEditing(null);
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, slug: true, description: true });
    setServerErrors({});
    if (!formValid) {
      if (normalizedName.length < 2 || duplicateName) nameRef.current?.focus();
      else slugRef.current?.focus();
      return;
    }
    setCreating(true);
    try {
      await create({
        kind,
        name: normalizedName,
        slug,
        ...(kind === "category" ? { description: description.trim() } : {}),
      });
      resetCreateForm(kind);
    } catch (error) {
      const fields = error instanceof AdminApiError ? error.fields : undefined;
      const nextErrors = Object.fromEntries(
        Object.entries(fields || {}).map(([field, messages]) => [field, messages[0] || "مقدار معتبر نیست."]),
      );
      setServerErrors(nextErrors);
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.slug) slugRef.current?.focus();
      toast.error("ساخت دسته یا برچسب انجام نشد", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card data-admin-form-root className="p-4">
      <h3 className="font-bold">دسته‌ها و برچسب‌ها</h3>
      <p className="text-foreground-muted mt-1 text-[11px] leading-5">
        دسته، موضوع اصلی مقاله است؛ برچسب برای جزئیات و ارتباط میان چند مقاله استفاده می‌شود.
      </p>
      <form onSubmit={submitCreate} noValidate className="mt-4 space-y-3">
        <label className="text-foreground-muted block text-xs font-semibold">
          نوع طبقه‌بندی
          <select
            aria-label="نوع طبقه‌بندی"
            value={kind}
            onChange={(event) => resetCreateForm(event.target.value as "category" | "tag")}
            className="rounded-control border-border bg-background mt-1.5 h-10 w-full border px-2 text-xs"
          >
            <option value="category">دسته</option>
            <option value="tag">برچسب</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <label className="text-foreground-muted block text-xs font-semibold">
            نام {kind === "category" ? "دسته" : "برچسب"}
            <input
              ref={nameRef}
              required
              minLength={2}
              maxLength={120}
              aria-invalid={Boolean(nameError)}
              aria-describedby="taxonomy-name-help taxonomy-name-error"
              data-field-label={kind === "category" ? "نام دسته" : "نام برچسب"}
              value={name}
              onBlur={() => setTouched((value) => ({ ...value, name: true }))}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                setServerErrors((errors) => ({ ...errors, name: "" }));
                if (!slugEdited) setSlug(normalizeTaxonomySlug(value));
              }}
              placeholder={kind === "category" ? "مثلاً بازاریابی" : "مثلاً هوش مصنوعی"}
              className="rounded-control border-border mt-1.5 h-10 w-full border px-2 text-xs"
            />
            <span id="taxonomy-name-help" className="text-foreground-subtle mt-1 flex justify-between text-[10px]">
              <span>۲ تا ۱۲۰ کاراکتر</span><span>{name.length}/120</span>
            </span>
            {nameError ? <span id="taxonomy-name-error" role="alert" className="text-error mt-1 block text-[11px]">{nameError}</span> : null}
          </label>
          <label className="text-foreground-muted block text-xs font-semibold">
            نامک انگلیسی
            <input
              ref={slugRef}
              dir="ltr"
              required
              minLength={2}
              maxLength={120}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              aria-invalid={Boolean(slugError)}
              aria-describedby="taxonomy-slug-help taxonomy-slug-error"
              data-field-label={kind === "category" ? "نامک دسته" : "نامک برچسب"}
              value={slug}
              onBlur={() => setTouched((value) => ({ ...value, slug: true }))}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(normalizeTaxonomySlug(event.target.value));
                setServerErrors((errors) => ({ ...errors, slug: "" }));
              }}
              placeholder="smart-marketing"
              className="rounded-control border-border mt-1.5 h-10 w-full border px-2 text-left text-xs"
            />
            <span id="taxonomy-slug-help" className="text-foreground-subtle mt-1 block text-[10px] leading-4">
              {name && !slug && !slugEdited
                ? "برای نام فارسی، نامک کوتاه انگلیسی وارد کنید."
                : "حروف کوچک انگلیسی، عدد و خط تیره؛ بدون فاصله"}
            </span>
            {slugError ? <span id="taxonomy-slug-error" role="alert" className="text-error mt-1 block text-[11px]">{slugError}</span> : null}
          </label>
        </div>
        {kind === "category" ? (
          <label className="text-foreground-muted block text-xs font-semibold">
            توضیح دسته <span className="font-normal">(اختیاری)</span>
            <textarea
              maxLength={500}
              value={description}
              aria-invalid={Boolean(descriptionError)}
              aria-describedby="taxonomy-description-count taxonomy-description-error"
              onChange={(event) => {
                setDescription(event.target.value);
                setServerErrors((errors) => ({ ...errors, description: "" }));
              }}
              className="rounded-control border-border mt-1.5 min-h-20 w-full resize-y border p-2 text-xs leading-6"
              placeholder="توضیح کوتاهی که در صفحه دسته نمایش داده می‌شود…"
            />
            <span id="taxonomy-description-count" className="text-foreground-subtle mt-1 block text-left text-[10px]">{description.length}/500</span>
            {descriptionError ? <span id="taxonomy-description-error" role="alert" className="text-error mt-1 block text-[11px]">{descriptionError}</span> : null}
          </label>
        ) : null}
        {slug && TAXONOMY_SLUG_PATTERN.test(slug) ? (
          <div dir="ltr" className="rounded-control bg-surface-hover text-foreground-muted truncate px-3 py-2 text-left text-[11px]">
            /blog/{kind === "category" ? "category" : "tag"}/{slug}
          </div>
        ) : null}
        <Button type="submit" disabled={!formValid || creating} className="w-full">
          {creating ? <><LoaderCircle size={14} className="animate-spin" /> در حال ساخت…</> : `ساخت ${kind === "category" ? "دسته" : "برچسب"}`}
        </Button>
      </form>
      <label className="text-foreground-muted mt-5 block text-xs font-semibold">
        جست‌وجوی {kind === "category" ? "دسته‌ها" : "برچسب‌ها"}
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام یا نامک…" className="rounded-control border-border mt-1.5 h-10 w-full border px-3 text-xs" />
      </label>
      <div className="mt-3 space-y-2">
        {!filtered.length ? (
          <p className="rounded-control border-border text-foreground-muted border border-dashed p-4 text-center text-xs">
            {query ? "موردی مطابق جست‌وجو پیدا نشد." : `هنوز ${kind === "category" ? "دسته‌ای" : "برچسبی"} ساخته نشده است.`}
          </p>
        ) : null}
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border-border rounded-control border p-2 text-xs"
          >
            {editing?.id === item.id ? (
              <form className="space-y-2" onSubmit={async (event) => {
                event.preventDefault();
                if (!editValid || editSaving) return;
                setEditSaving(true);
                try {
                  if (await update({ kind, id: item.id, name: editName.trim(), slug: editSlug, description: editDescription.trim() })) setEditing(null);
                } finally {
                  setEditSaving(false);
                }
              }}>
                <label className="text-foreground-muted block font-semibold">نام
                  <input required minLength={2} maxLength={120} value={editName} onChange={(event) => setEditName(event.target.value)} className="rounded-control border-border mt-1 h-9 w-full border px-2" />
                  {editDuplicateName ? <span role="alert" className="text-error mt-1 block">این نام قبلاً استفاده شده است.</span> : null}
                </label>
                <label className="text-foreground-muted block font-semibold">نامک انگلیسی
                  <input dir="ltr" required minLength={2} maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={editSlug} onChange={(event) => setEditSlug(normalizeTaxonomySlug(event.target.value))} className="rounded-control border-border mt-1 h-9 w-full border px-2 text-left" />
                  {editDuplicateSlug ? <span role="alert" className="text-error mt-1 block">این نامک قبلاً استفاده شده است.</span> : null}
                </label>
                {kind === "category" ? <label className="text-foreground-muted block font-semibold">توضیح دسته
                  <textarea maxLength={500} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="rounded-control border-border mt-1 min-h-16 w-full border p-2" />
                  <span className="text-foreground-subtle mt-1 block text-left text-[10px]">{editDescription.length}/500</span>
                </label> : null}
                <div className="flex gap-2"><Button type="submit" size="sm" disabled={!editValid || editSaving}>{editSaving ? "در حال ذخیره…" : "ذخیره"}</Button><Button type="button" size="sm" variant="secondary" disabled={editSaving} onClick={() => setEditing(null)}>انصراف</Button></div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div><span>{item.name} <span dir="ltr" className="text-foreground-subtle">({item.slug})</span> · {item._count.posts.toLocaleString("fa-IR")} مقاله</span>{item.description ? <p className="text-foreground-muted mt-1 line-clamp-2 leading-5">{item.description}</p> : null}</div>
                <span className="flex gap-1">
                  <button type="button" aria-label={`ویرایش ${item.name}`} onClick={() => { setEditing(item); setEditName(item.name); setEditSlug(item.slug); setEditDescription(item.description || ""); }} className="hover:bg-primary/10 inline-flex size-7 items-center justify-center rounded"><Pencil size={12} /></button>
                  {canDelete ? (
                    <button type="button" aria-label={`حذف ${item.name}`} onClick={() => { setDeleteTarget(item); setReplacementId(""); }} className="hover:bg-error/10 hover:text-error inline-flex size-7 items-center justify-center rounded"><Trash2 size={12} /></button>
                  ) : null}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          void remove(kind, target.id, replacementId || undefined);
        }}
        title={deleteTarget?._count.posts ? "انتقال و ادغام طبقه‌بندی" : "حذف طبقه‌بندی"}
        description={deleteTarget ? `«${deleteTarget.name}» حذف می‌شود.` : ""}
        consequences={[deleteTarget?._count.posts ? "همه مقاله‌های متصل باید به گزینه جایگزین منتقل شوند." : "این مورد مقاله متصل ندارد و حذف می‌شود."]}
        confirmLabel={deleteTarget?._count.posts ? "انتقال و حذف" : "حذف"}
        confirmDisabled={Boolean(deleteTarget?._count.posts && !replacementId)}
      >
        {deleteTarget?._count.posts ? (
          <label className="mb-3 block text-xs font-semibold">جایگزین
            <select value={replacementId} onChange={(event) => setReplacementId(event.target.value)} className="rounded-control border-border mt-2 h-10 w-full border px-2">
              <option value="">انتخاب کنید…</option>
              {items.filter((item) => item.id !== deleteTarget.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        ) : null}
      </ConfirmDialog>
    </Card>
  );
}
function Field({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`text-foreground-muted block text-xs font-semibold ${wide ? "sm:col-span-2" : ""}`}
    >
      <span>{label}</span>
      <div className="[&_input]:rounded-control [&_input]:border-border [&_input]:bg-background [&_textarea]:rounded-control [&_textarea]:border-border [&_textarea]:bg-background mt-2 [&_input]:h-11 [&_input]:w-full [&_input]:border [&_input]:px-3 [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:border [&_textarea]:p-3 [&_textarea]:text-sm [&_textarea]:leading-7">
        {children}
      </div>
    </label>
  );
}
function Count({ value, max }: { value: string; max: number }) {
  return (
    <span className="text-foreground-subtle mt-1 block text-left text-[10px]">
      {value.length}/{max}
    </span>
  );
}
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-control border-border bg-surface-hover border p-3">
      <div className="text-foreground-muted text-[11px]">{label}</div>
      <div className="font-display mt-1 text-xl font-black">
        {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
      </div>
    </div>
  );
}
function wordDelta(previous: string, current: string) {
  const counts = (value: string) => {
    const map = new Map<string, number>();
    for (const word of value.trim().split(/\s+/).filter(Boolean))
      map.set(word, (map.get(word) || 0) + 1);
    return map;
  };
  const before = counts(previous);
  const after = counts(current);
  let added = 0;
  let removed = 0;
  for (const [word, count] of after)
    added += Math.max(0, count - (before.get(word) || 0));
  for (const [word, count] of before)
    removed += Math.max(0, count - (after.get(word) || 0));
  return { added, removed };
}
