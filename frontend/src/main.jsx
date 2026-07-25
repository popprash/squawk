import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ClerkProvider , SignInButton , SignUpButton , UserButton , Show} from "@clerk/react";
import App from "./App";
import {BrowserRouter} from 'react-router';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        elements: {
          footer: "hidden"
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
);
