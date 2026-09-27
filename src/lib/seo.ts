import type { Metadata } from "next";

export const defaultSocialImage = {
  url: "/img/Binix-Logo.png",
  width: 1200,
  height: 630,
  alt: "Binix",
};

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type PageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  robots?: Metadata["robots"];

  /**
   * SEO title handling
   * If true/defined Next will not append default suffix.
   */
  absoluteTitle?: boolean;

  type?: "website" | "article";

  image?: {
    url: string;
    alt?: string;
  };

  publishedTime?: string;
  modifiedTime?: string;
};

export function createPageMetadata(
  input: PageMetadataInput,
): Metadata {
  const title = input.absoluteTitle
    ? {
        absolute: input.title,
      }
    : input.title;

  const images = input.image
    ? [
        {
          url: input.image.url,
          alt: input.image.alt,
        },
      ]
    : [
        {
          url: defaultSocialImage.url,
          width: defaultSocialImage.width,
          height: defaultSocialImage.height,
          alt: defaultSocialImage.alt,
        },
      ];

  const openGraph: NonNullable<Metadata["openGraph"]> =
    input.type === "article"
      ? {
          type: "article",
          title: input.title,
          description: input.description,
          url: input.path,
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
          images,
        }
      : {
          type: "website",
          title: input.title,
          description: input.description,
          url: input.path,
          images,
        };


return {
  title,
  description: input.description,

  alternates: input.path

      ? {
          canonical: input.path,
        }
      : undefined,

    robots: input.robots,

    openGraph,

    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: input.image
        ? [input.image.url]
        : [defaultSocialImage.url],
    },
  };
}

export function toIsoDate(
  value: Date | string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export function toPersianDate(
  value: Date | string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
