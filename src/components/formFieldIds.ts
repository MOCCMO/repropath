export function fieldDescriptionIds(htmlFor: string, error?: string) {
  return error
    ? `${htmlFor}-hint ${htmlFor}-error`
    : `${htmlFor}-hint`;
}
