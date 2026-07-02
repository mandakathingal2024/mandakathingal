/**
 * Server-side reads of PUBLIC Firestore collections via the REST API.
 *
 * Used by ISR/server components so public pages (events, gallery, executives,
 * home content) can be pre-rendered with their data already in the HTML —
 * no client-side Firebase SDK round trip, better LCP, and no cold-start wait
 * for content. Only works for collections whose rules allow unauthenticated
 * reads (events, gallery, executives, websiteContent).
 */

const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function parseValue(v) {
  if (v == null) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(parseValue);
  if (v.mapValue !== undefined) return parseFields(v.mapValue.fields || {});
  return null;
}

function parseFields(fields) {
  const out = {};
  for (const [k, val] of Object.entries(fields)) out[k] = parseValue(val);
  return out;
}

/**
 * Fetch all documents of a public collection. Returns [] on any error so a
 * page never crashes if Firestore is briefly unreachable.
 *
 * @param {string} name         collection name
 * @param {object} opts         { revalidate?: number } ISR revalidate seconds
 */
export async function getPublicCollection(name, { revalidate = 3600 } = {}) {
  if (!PROJECT) return [];
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${name}?pageSize=300`;
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return [];
    const data = await res.json();
    const docs = data.documents || [];
    // Match the client shape: Firestore doc id, then fields (a custom `id`
    // field, if present, intentionally overrides the doc id — same as the
    // client code `{ id: doc.id, ...doc.data() }`).
    return docs.map((d) => ({ id: d.name.split('/').pop(), ...parseFields(d.fields || {}) }));
  } catch {
    return [];
  }
}
