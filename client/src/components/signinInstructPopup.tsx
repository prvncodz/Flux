import { useState, useEffect } from "react";

export default function SignInBanner({ setShowPopup }) {
  useEffect(() => {}, []);
  return (
    <div className="w-full px-3 pt-3 sm:px-4 sm:pt-4 absolute top-12 left-0  md:left-1/4 lg:left-1/3  origin-center z-30">
      <div className="flex items-center gap-2.5 bg-white border border-red-100 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm w-full sm:max-w-md">
        {/* Icon */}
        <div className="shrink-0 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 text-red-500"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 3v4M7 9.5V10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Text */}
        <p className="flex-1 text-[13px] sm:text-sm text-gray-500 leading-snug">
          <a
            href="/signin"
            className="font-medium text-blue-500 underline underline-offset-2 hover:text-blue-600 transition-colors"
          >
            Sign in
          </a>{" "}
          to perform this operation
        </p>

        {/* Close */}
        <button
          onClick={() => setShowPopup(false)}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
