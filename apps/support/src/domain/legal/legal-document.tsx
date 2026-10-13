import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type LegalDocumentProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalDocument({ title, children }: LegalDocumentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
      <h1>{title}</h1>
      <Alert>
        <AlertTitle>Placeholder — owner review required</AlertTitle>
        <AlertDescription>
          This text is a draft placeholder for legal review. Do not rely on it
          for compliance until your organization&apos;s counsel approves final
          copy.
        </AlertDescription>
      </Alert>
      {children}
    </article>
  );
}
