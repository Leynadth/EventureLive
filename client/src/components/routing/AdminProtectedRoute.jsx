import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 rounded-full border-2 border-[#2e6b4e] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default AdminProtectedRoute;
