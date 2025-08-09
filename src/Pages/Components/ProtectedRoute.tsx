import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ensureAuth } from "../../Utils/ensureAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await ensureAuth();
      setAllowed(result);
      setChecking(false);
    };
    checkAuth();
  }, []);

  if (checking) return <div>Loading...</div>;

  return allowed ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
