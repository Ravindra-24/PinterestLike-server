export const encodeCursor = (document) =>
  Buffer.from(JSON.stringify({ createdAt: document.createdAt.toISOString(), id: document._id.toString() })).toString("base64url");

export const decodeCursor = (cursor) => {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (!parsed.createdAt || !parsed.id) return null;
    return { createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    return null;
  }
};

export const cursorFilter = (cursor) => {
  const decoded = decodeCursor(cursor);
  if (!decoded) return {};
  return {
    $or: [
      { createdAt: { $lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
    ],
  };
};
