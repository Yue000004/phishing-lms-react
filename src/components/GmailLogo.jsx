import React from "react";
import gmailLogo from "../assets/gmail.svg";

export default function GmailLogo({ className = "w-16 h-16" }) {
  return (
    <img
      src={gmailLogo}
      alt="Gmail"
      className={className}
    />
  );
}
