import localFont from "next/font/local";
import "./globals.css";
import { StoryProvider } from './context/StoryContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: 'Офигенные истории',
  description: 'Генератор уникальных историй с помощью AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <StoryProvider>
          <div className="min-h-screen flex flex-col items-center p-4 bg-background">
            <div className="w-full max-w-4xl space-y-8 py-8">
              {children}
            </div>
          </div>
        </StoryProvider>
      </body>
    </html>
  );
}
