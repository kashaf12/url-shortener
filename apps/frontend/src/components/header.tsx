"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Code,
  LayoutDashboard,
  Settings,
  BarChart3,
  QrCode,
  Key,
  Activity,
  ExternalLink,
  BookOpen,
  Github,
  Zap,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Close mobile menu when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  // Mock API usage data
  const apiUsage = {
    urls: { used: 1247, total: 5000, percent: 25 },
    qrCodes: { used: 89, total: 500, percent: 18 },
    apiCalls: { used: 3542, total: 10000, percent: 35 },
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Documentation", href: "/docs", icon: BookOpen },
    { name: "API", href: "/docs/api-reference", icon: Code },
    ...(isAuthenticated
      ? [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }]
      : []),
  ];

  const userNavigation = isAuthenticated
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "QR Codes", href: "/qr-code", icon: QrCode },
        { name: "Profile", href: "/profile", icon: Settings },
      ]
    : [];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">URLShortener</span>
            <Badge variant="outline" className="ml-2 text-xs">
              Open Source
            </Badge>
          </Link>
        </div>

        {/* Centered Navigation */}
        <div className="flex-1 flex justify-center">
          <nav className="hidden md:flex gap-1">
            {navigation.map(item => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* GitHub Link */}
          <Link
            href="https://github.com/kashaf12/url-shortener"
            target="_blank"
            className="hidden md:flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>

          <div className="hidden md:flex gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-0">
                  <div className="flex items-center gap-3 p-4 border-b">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-3 px-1">
                    <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                      Navigation
                    </DropdownMenuLabel>

                    <div className="space-y-1">
                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md ${pathname === "/dashboard" ? "bg-black text-white" : ""}`}
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center cursor-pointer"
                        >
                          <LayoutDashboard
                            className={`h-4 w-4 mr-3 ${pathname === "/dashboard" ? "text-white" : "text-gray-500"}`}
                          />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md ${pathname === "/analytics" ? "bg-black text-white" : ""}`}
                      >
                        <Link
                          href="/analytics"
                          className="flex items-center cursor-pointer"
                        >
                          <BarChart3
                            className={`h-4 w-4 mr-3 ${pathname === "/analytics" ? "text-white" : "text-gray-500"}`}
                          />
                          Analytics
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md ${pathname === "/qr-code" ? "bg-black text-white" : ""}`}
                      >
                        <Link
                          href="/qr-code"
                          className="flex items-center cursor-pointer"
                        >
                          <QrCode
                            className={`h-4 w-4 mr-3 ${pathname === "/qr-code" ? "text-white" : "text-gray-500"}`}
                          />
                          QR Codes
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-3" />

                    <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                      Settings
                    </DropdownMenuLabel>

                    <div className="space-y-1">
                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md ${pathname === "/profile" ? "bg-black text-white" : ""}`}
                      >
                        <Link
                          href="/profile"
                          className="flex items-center cursor-pointer"
                        >
                          <User
                            className={`h-4 w-4 mr-3 ${pathname === "/profile" ? "text-white" : "text-gray-500"}`}
                          />
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md ${pathname === "/profile?tab=api-keys" ? "bg-black text-white" : ""}`}
                      >
                        <Link
                          href="/profile?tab=api-keys"
                          className="flex items-center cursor-pointer"
                        >
                          <Key
                            className={`h-4 w-4 mr-3 ${pathname === "/profile?tab=api-keys" ? "text-white" : "text-gray-500"}`}
                          />
                          API Keys
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>

                  {/* API Usage Statistics */}
                  <div className="border-t border-b p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-gray-500" />
                        API Usage
                      </h3>
                      <Link
                        href="/profile?tab=api-keys"
                        className="text-xs text-blue-600 hover:underline flex items-center"
                      >
                        Details
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600">URLs Shortened</span>
                          <span className="text-gray-500 font-medium">
                            {apiUsage.urls.used.toLocaleString()} /{" "}
                            {apiUsage.urls.total.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={apiUsage.urls.percent}
                          className="h-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600">
                            QR Codes Generated
                          </span>
                          <span className="text-gray-500 font-medium">
                            {apiUsage.qrCodes.used.toLocaleString()} /{" "}
                            {apiUsage.qrCodes.total.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={apiUsage.qrCodes.percent}
                          className="h-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600">API Calls</span>
                          <span className="text-gray-500 font-medium">
                            {apiUsage.apiCalls.used.toLocaleString()} /{" "}
                            {apiUsage.apiCalls.total.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={apiUsage.apiCalls.percent}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 cursor-pointer px-3 py-2.5 rounded-md"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                {/* Header with logo */}
                <div className="border-b p-4 flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold mr-2">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold">URLShortener</span>
                </div>

                {/* Main navigation */}
                <div className="flex-1 overflow-auto py-4 px-3">
                  <div className="space-y-2 mb-6">
                    {navigation.map(item => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center px-4 py-3.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? "bg-black text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`}
                          />
                          {item.name}
                        </Link>
                      );
                    })}

                    {/* GitHub Link in Mobile */}
                    <Link
                      href="https://github.com/kashaf12/url-shortener"
                      target="_blank"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-4 py-3.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Github className="mr-3 h-5 w-5 text-gray-500" />
                      GitHub
                    </Link>
                  </div>

                  {/* User section */}
                  {isAuthenticated && (
                    <>
                      {userNavigation.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            User Menu
                          </div>
                          <div className="space-y-2 mb-6">
                            {userNavigation.map(item => {
                              const isActive = pathname === item.href;
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`flex items-center px-4 py-3.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                      ? "bg-black text-white"
                                      : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <Icon
                                    className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`}
                                  />
                                  {item.name}
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* User profile and logout */}
                <div className="border-t p-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center px-4 py-3.5 rounded-lg bg-gray-50">
                        <User className="h-5 w-5 text-gray-500 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-5 w-5 text-red-500" />
                        <span className="text-red-500">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base bg-transparent"
                        >
                          <LogIn className="mr-3 h-5 w-5" />
                          <span>Log in</span>
                        </Button>
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button className="w-full h-12 text-base">
                          <UserPlus className="mr-3 h-5 w-5" />
                          <span>Sign up</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
