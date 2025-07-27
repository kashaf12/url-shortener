import Link from "next/link";
import { Github, Twitter, Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold">URLShortener</span>
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Open-source, developer-first URL shortening platform.
              Self-hostable with enterprise features and React integration.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/kashaf12/url-shortener"
                className="text-gray-600 hover:text-black"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://twitter.com/kashaf12"
                className="text-gray-600 hover:text-black"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-black"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-black"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/qr-code"
                  className="text-gray-600 hover:text-black"
                >
                  QR Codes
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-600 hover:text-black"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-black">
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api-reference"
                  className="text-gray-600 hover:text-black"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/integration/react-hook"
                  className="text-gray-600 hover:text-black"
                >
                  React Hook
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/deployment"
                  className="text-gray-600 hover:text-black"
                >
                  Self-Hosting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-black">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 hover:text-black"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-black">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} URLShortener. Open source under MIT License.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              href="https://github.com/kashaf12/url-shortener/releases"
              className="text-sm text-gray-600 hover:text-black"
            >
              v2.1.0
            </Link>
            <Link
              href="https://status.kashaf12.com"
              className="text-sm text-gray-600 hover:text-black"
            >
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
