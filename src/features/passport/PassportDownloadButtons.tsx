import { Download } from "lucide-react";
import {
  passportToJson,
  passportToMarkdown,
  type Passport
} from "../../domain/passportGenerator";

type PassportDownloadButtonsProps = {
  passport: Passport;
};

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function PassportDownloadButtons({ passport }: PassportDownloadButtonsProps) {
  const base = "repropath-fasttext-passport";
  return (
    <div className="download-actions">
      <button
        className="button button-secondary"
        type="button"
        onClick={() =>
          downloadFile(`${base}.md`, passportToMarkdown(passport), "text/markdown;charset=utf-8")
        }
      >
        <Download size={17} /> Download Markdown
      </button>
      <button
        className="button button-secondary"
        type="button"
        onClick={() =>
          downloadFile(
            `${base}.json`,
            passportToJson(passport),
            "application/json;charset=utf-8"
          )
        }
      >
        <Download size={17} /> Download JSON
      </button>
    </div>
  );
}
