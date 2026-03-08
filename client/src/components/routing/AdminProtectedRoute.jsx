import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../contexts/AuthContext";

function AdminProtectedRoute({ children }) {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default AdminProtectedRoute;
