"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const submitText = /^(ذخیره|ایجاد|ثبت|ارسال|انتشار|ساخت|افزودن)/;

function fieldLabel(field: FormControl) {
  const explicit = field.getAttribute("data-field-label");
  if (explicit) return explicit;

  const label = field.closest("label");
  const text = label?.textContent?.replace(/\s+/g, " ").trim();
  return text?.slice(0, 80) || field.getAttribute("placeholder") || "این فیلد";
}

function validationMessage(field: FormControl) {
  if (field.validity.typeMismatch) return "فرمت واردشده معتبر نیست.";
  if (field.validity.patternMismatch) return "مقدار واردشده با فرمت موردنیاز مطابقت ندارد.";
  if (field.validity.tooShort) return `حداقل ${Number(field.getAttribute("minlength")).toLocaleString("fa-IR")} نویسه وارد کنید.`;
  if (field.validity.tooLong) return `حداکثر ${Number(field.getAttribute("maxlength")).toLocaleString("fa-IR")} نویسه مجاز است.`;
  if (field.validity.rangeUnderflow) return `مقدار باید حداقل ${field.getAttribute("min")} باشد.`;
  if (field.validity.rangeOverflow) return `مقدار باید حداکثر ${field.getAttribute("max")} باشد.`;
  return field.getAttribute("data-required-message") || "این فیلد اجباری است.";
}

function isInvalid(field: FormControl) {
  if (field.disabled || field.closest("[disabled]")) return false;

  if (field.required) {
    if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
      if (!field.checked) return true;
    } else if (field instanceof HTMLInputElement && field.type === "file") {
      if (!field.files?.length) return true;
    } else if (!field.value.trim()) {
      return true;
    }
  }

  return !field.validity.valid;
}

function errorHost(field: FormControl) {
  return field.closest<HTMLElement>("[data-admin-field]") || field.closest<HTMLElement>("label") || field.parentElement;
}

function clearError(field: FormControl) {
  field.removeAttribute("aria-invalid");
  field.classList.remove("admin-field-invalid");
  errorHost(field)?.querySelector(":scope > [data-admin-validation-error]")?.remove();
}

function markError(field: FormControl) {
  clearError(field);
  field.setAttribute("aria-invalid", "true");
  field.classList.add("admin-field-invalid");

  const message = document.createElement("p");
  message.dataset.adminValidationError = "true";
  message.setAttribute("role", "alert");
  message.textContent = validationMessage(field);
  message.className = "admin-validation-message";
  errorHost(field)?.append(message);
}

function requiredFields(scope: ParentNode) {
  return Array.from(
    scope.querySelectorAll<FormControl>("input[required], select[required], textarea[required]"),
  );
}

function validate(scope: ParentNode) {
  const invalid = requiredFields(scope).filter(isInvalid);
  requiredFields(scope).forEach((field) => {
    if (invalid.includes(field)) markError(field);
    else clearError(field);
  });

  if (!invalid.length) return true;

  const first = invalid[0];
  first.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  window.setTimeout(() => first.focus({ preventScroll: true }), 280);
  toast.error(`${fieldLabel(first)} را کامل کنید`, {
    description: validationMessage(first),
  });
  return false;
}

export function AdminFormValidation() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>("button");
      if (!button || button.disabled) return;

      const isSubmit =
        button.dataset.adminSubmit === "true" ||
        button.getAttribute("type") === "submit" ||
        submitText.test(button.textContent?.trim() || "");
      if (!isSubmit) return;

      const scope = button.closest<HTMLElement>("[data-admin-form-root], [role='dialog'], form");
      if (!scope || validate(scope)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const onSubmit = (event: SubmitEvent) => {
      if (validate(event.target as HTMLFormElement)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const onInput = (event: Event) => {
      const field = event.target;
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ) {
        if (!isInvalid(field)) clearError(field);
      }
    };

    const onBlur = (event: FocusEvent) => {
      const field = event.target;
      if (
        (field instanceof HTMLInputElement ||
          field instanceof HTMLSelectElement ||
          field instanceof HTMLTextAreaElement) &&
        field.required &&
        isInvalid(field)
      ) {
        markError(field);
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    document.addEventListener("focusout", onBlur, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
      document.removeEventListener("focusout", onBlur, true);
    };
  }, []);

  return (
    <style jsx global>{`
      .admin-field-invalid {
        border-color: var(--error) !important;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 14%, transparent) !important;
      }
      .admin-validation-message {
        margin-top: 0.375rem;
        color: var(--error);
        font-family: var(--font-ui), sans-serif;
        font-size: 0.6875rem;
        line-height: 1.5;
      }
      label:has(> input[required]) > :first-child::after,
      label:has(> select[required]) > :first-child::after,
      label:has(> textarea[required]) > :first-child::after {
        content: " *";
        color: var(--error);
      }
    `}</style>
  );
}
