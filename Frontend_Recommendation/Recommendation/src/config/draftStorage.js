const tokenUserId = () => {
  try {
    const token = localStorage.getItem("token");
    return token ? JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))?.id : null;
  } catch { return null; }
};

const prefix = () => `careermatch:draft:${tokenUserId() || "anonymous"}`;
export const draftKey = (name) => `${prefix()}:${name}`;
export const clearCurrentUserDraft = () => ["data", "step", "completed", "badges"].forEach((name) => localStorage.removeItem(draftKey(name)));
