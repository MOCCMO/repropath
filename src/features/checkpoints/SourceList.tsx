import { ExternalLink } from "lucide-react";
import type { SourceReference } from "../../domain/schemas";

type SourceListProps = {
  sources: SourceReference[];
};

const repositoryPrefix = "repository-file:";

export function SourceList({ sources }: SourceListProps) {
  if (!sources.length) {
    return <p className="learner-source-note">Source: learner-entered record.</p>;
  }

  return (
    <ul className="source-list" aria-label="Evidence sources">
      {sources.map((source) => {
        const key = `${source.claimId}:${source.url}:${source.locator}`;
        const isRepositoryFile = source.url.startsWith(repositoryPrefix);
        return (
          <li key={key}>
            <span className="source-claim">{source.claimId}</span>
            {isRepositoryFile ? (
              <span>
                ReproPath repository file{" "}
                <code>{source.url.slice(repositoryPrefix.length)}</code>
              </span>
            ) : (
              <a href={source.url} target="_blank" rel="noreferrer">
                Open source <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
            <span className="source-locator">Locator: {source.locator}</span>
          </li>
        );
      })}
    </ul>
  );
}
