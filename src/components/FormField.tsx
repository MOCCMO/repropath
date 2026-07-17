import type { PropsWithChildren, ReactNode } from "react";

type FormFieldProps = PropsWithChildren<{
  label: string;
  htmlFor: string;
  hint: string;
  error?: string;
  optional?: boolean;
  action?: ReactNode;
}>;

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  optional,
  action,
  children
}: FormFieldProps) {
  return (
    <div className="form-field">
      <div className="field-heading">
        <label htmlFor={htmlFor}>
          {label} {optional && <span className="optional">(optional)</span>}
        </label>
        {action}
      </div>
      <p className="field-hint" id={`${htmlFor}-hint`}>
        {hint}
      </p>
      <div>{children}</div>
      {error && (
        <p className="field-error" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
