// src/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md space-y-6">
        <div style={{ fontSize: 72 }}>🎓</div>
        <h1 className="text-6xl font-black text-text">404</h1>
        <h2 className="text-2xl font-bold text-text">Page Not Found</h2>
        <p className="text-text-muted leading-relaxed">
          This page doesn't exist — but your exam score can. Let's get back to studying.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to="/" className="btn-primary px-8 py-3 text-sm font-bold">
            Go to Homepage
          </Link>
          <Link to="/dashboard" className="btn-secondary px-8 py-3 text-sm font-bold">
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
