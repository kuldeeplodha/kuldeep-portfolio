import { portfolioConfig } from '../../config'

export function EducationSection() {
  const { education } = portfolioConfig

  return (
    <section id="education" className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Education
        </h2>

        <ol className="relative border-l pl-8" style={{ borderColor: 'var(--color-border)' }}>
          {education.map((edu) => (
            <li key={edu.id} className="mb-10 last:mb-0">
              <span
                className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--color-accent)' }}
                aria-hidden
              />
              <article
                className="rounded-xl border p-6"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <time
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-accent)' }}
                  dateTime={edu.period}
                >
                  {edu.period}
                </time>
                <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {edu.degree}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {edu.institution} · {edu.location}
                </p>
                {edu.gpa && (
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-text)' }}>
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.research && (
                  <p className="mt-2 text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                    Research: {edu.research}
                  </p>
                )}
                {edu.highlights && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {edu.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
