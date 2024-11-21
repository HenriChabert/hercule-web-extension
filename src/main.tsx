import React from "react";
import ReactDOM from "react-dom/client";
import Connect from "./app/Connect.tsx";
import Home from "./app/Home.tsx";
import { Theme } from "@radix-ui/themes";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import "@radix-ui/themes/styles.css";
import "./index.css";
import { ToasterProvider } from "./app/components/toaster/ToasterProvider";

const router = createMemoryRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/connect",
    element: <Connect />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme accentColor="red">
      <ToasterProvider>
        <RouterProvider router={router} />
      </ToasterProvider>
    </Theme>
  </React.StrictMode>
);
