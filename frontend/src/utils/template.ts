import type { Template } from "../types/api";

const FORMAL_KEYWORDS = ["bank", "finance", "legal", "formal", "conservative"];
const CREATIVE_KEYWORDS = ["creative", "design", "modern", "startup", "brand"];
const LEADERSHIP_KEYWORDS = ["executive", "lead", "manager", "director", "vp"];

function includesKeyword(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}

export function getTemplateUseCase(
  template: Pick<Template, "name" | "description"> | null | undefined,
): string {
  if (!template) {
    return "General-purpose template for most job applications.";
  }

  const description = template.description?.trim();
  if (description) return description;

  const normalizedName = template.name.toLowerCase();
  if (includesKeyword(normalizedName, FORMAL_KEYWORDS)) {
    return "Best for formal industries where conservative formatting is preferred.";
  }
  if (includesKeyword(normalizedName, CREATIVE_KEYWORDS)) {
    return "Best for modern or creative roles that benefit from visual character.";
  }
  if (includesKeyword(normalizedName, LEADERSHIP_KEYWORDS)) {
    return "Best for leadership profiles focused on strategic impact.";
  }
  return "General-purpose template for most job applications.";
}

export function matchesTemplateQuery(template: Template, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") return true;

  return [template.name, template.description ?? "", template.id].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}
