import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import TopLoadingBar from "@/components/TopLoadingBar";
import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <TopLoadingBar />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;