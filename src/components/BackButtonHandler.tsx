import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = CapApp.addListener("backButton", () => {
      if (location.pathname === "/") return;
      navigate(-1);
    });
    return () => { handler.then(h => h.remove()); };
  }, [location.pathname, navigate]);

  return null;
}
