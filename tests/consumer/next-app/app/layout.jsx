import { LufiaProvider } from "@lufia/design-system/components/LufiaProvider";
import "@lufia/design-system/tokens.css";
import "@lufia/design-system/themes/default.css";

export const metadata = { title: "Lufia consumer smoke" };

// A Server Component: the provider is a client component, so it must carry its own "use client".
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-lufia-theme="default" data-lufia-mode="light">
      <body>
        <LufiaProvider>{children}</LufiaProvider>
      </body>
    </html>
  );
}
