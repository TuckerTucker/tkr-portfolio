import type { GlobalProvider } from "@ladle/react";
import React, { useEffect } from "react";
import "../src/styles/tailwind.css";
import "../src/components/Header/Header.css";

export const Provider: GlobalProvider = ({ children, globalState }) => {
  useEffect(() => {
    if (globalState.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [globalState.theme]);

  return (
    <div className="min-h-screen bg-white p-4 !font-sans">
      {children}
    </div>
  );
};
