import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";

export default function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let handler: any;
    try {
      handler = CapApp.addListener("backButton", () => {
        if (location.pathname === "/") return;
        navigate(-1);
      });
    } catch (e) {
      console.warn("BackButton not available:", e);
    }
    return () => { if (handler) handler.then((h: any) => h.remove()); };
  }, [location.pathname, navigate]);

  return null;
}
