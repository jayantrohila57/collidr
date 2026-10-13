export function PlaceholderLegalBody({ topic }: { topic: string }) {
  return (
    <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
      <p>
        This {topic} page describes how Env Manager intends to operate. Replace
        this section with counsel-approved language before production use.
      </p>
      <p>
        Contact{" "}
        <a href="mailto:legal@example.com" className="underline">
          legal@example.com
        </a>{" "}
        with questions.
      </p>
    </div>
  );
}
