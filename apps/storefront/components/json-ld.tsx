/* One JSON-LD block. `<` is escaped so a string in the data can never close
   the script tag (the Next.js JSON-LD guide's own recommendation). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
