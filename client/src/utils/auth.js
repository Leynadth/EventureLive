
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("eventure_user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}


export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || "user";
}