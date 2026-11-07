import "@lufia/design-system/tokens.css";
import "@lufia/design-system/themes/default.css";

export const metadata = { title: "Lufia consumer smoke" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-lufia-theme="default" data-lufia-mode="light">
      <body>{children}</body>
    </html>
  );
}
