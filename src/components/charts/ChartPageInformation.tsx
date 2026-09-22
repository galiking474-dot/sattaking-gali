import type { InformationalPageContent } from "@/lib/chart-page-content";

export function ChartPageInformation({
  content,
}: {
  content: InformationalPageContent;
}) {
  return (
    <article className="rounded-xl border border-[#f0e2a6] bg-white p-5 text-gray-700 shadow-sm md:p-8">
      <p className="leading-7">{content.introduction}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-extrabold text-[#a5370c]">
              {section.heading}
            </h2>
            <p className="mt-2 text-sm leading-6">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-6 rounded-lg border border-[#f0e2a6] bg-[#fff7e0] p-4 text-sm font-semibold text-[#70501a]">
        <strong>Note:</strong> {content.note}
      </p>
    </article>
  );
}
