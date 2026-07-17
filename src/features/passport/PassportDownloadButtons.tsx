import { useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import {
  passportToJson,
  passportToMarkdown,
  type PassportV2
} from "../../domain/passportGenerator";
import { downloadFile } from "./downloadFile";

type PassportDownloadButtonsProps = {
  passport: PassportV2;
};

export function PassportDownloadButtons({ passport }: PassportDownloadButtonsProps) {
  const [exportError, setExportError] = useState<string | null>(null);
  const base = "repropath-fasttext-passport-v2";
  const exportPassport = (
    format: "Markdown" | "JSON",
    filename: string,
    serialize: () => string,
    type: string
  ) => {
    try {
      downloadFile(filename, serialize(), type);
      setExportError(null);
    } catch {
      setExportError(
        `${format} export failed. Your project is still saved in this browser; try the download again.`
      );
    }
  };
  return (
    <div>
      <div className="download-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() =>
            exportPassport(
              "Markdown",
              `${base}.md`,
              () => passportToMarkdown(passport),
              "text/markdown;charset=utf-8"
            )
          }
        >
          <Download size={17} /> Download Markdown
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() =>
            exportPassport(
              "JSON",
              `${base}.json`,
              () => passportToJson(passport),
              "application/json;charset=utf-8"
            )
          }
        >
          <Download size={17} /> Download JSON
        </button>
      </div>
      {exportError && (
        <p className="export-error" role="alert">
          <AlertTriangle size={16} aria-hidden="true" /> {exportError}
        </p>
      )}
    </div>
  );
}
