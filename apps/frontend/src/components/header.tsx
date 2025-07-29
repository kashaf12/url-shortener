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
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-effect">
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              URLShortener
            </span>
            <Badge
              variant="outline"
              className="ml-2 text-xs hidden sm:inline-flex"
            >
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-effect">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="cursor-pointer"
              >
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="cursor-pointer"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="cursor-pointer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* GitHub Link */}
          <Link
            href="https://github.com/kashaf12/url-shortener"
            target="_blank"
            className="hidden md:flex items-center text-muted-foreground hover:text-foreground transition-colors hover:scale-110 duration-300"
          >
            <Github className="h-5 w-5" />
          </Link>

          <div className="hidden md:flex gap-3">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-muted/50"
                  >
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="gap-2 hover:scale-105 transition-transform duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-muted/50"
                  >
                    <User className="h-4 w-4" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-0 glass-effect"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-border/50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-3 px-1">
                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      Navigation
                    </DropdownMenuLabel>

                    <div className="space-y-1">
                      {userNavigation.map(item => {
                        const isActive = pathname === item.href;
                        return (
                          <DropdownMenuItem
                            key={item.name}
                            asChild
                            className={`px-3 py-2.5 rounded-md cursor-pointer ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                          >
                            <Link
                              href={item.href}
                              className="flex items-center"
                            >
                              <item.icon
                                className={`h-4 w-4 mr-3 ${
                                  isActive
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground"
                                }`}
                              />
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>

                    <DropdownMenuSeparator className="my-3" />

                    <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      Settings
                    </DropdownMenuLabel>

                    <div className="space-y-1">
                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md cursor-pointer ${
                          pathname === "/profile"
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        <Link href="/profile" className="flex items-center">
                          <User
                            className={`h-4 w-4 mr-3 ${
                              pathname === "/profile"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className={`px-3 py-2.5 rounded-md cursor-pointer ${
                          pathname === "/profile?tab=api-keys"
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        <Link
                          href="/profile?tab=api-keys"
                          className="flex items-center"
                        >
                          <Key
                            className={`h-4 w-4 mr-3 ${
                              pathname === "/profile?tab=api-keys"
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                          API Keys
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>

                  {/* API Usage Statistics */}
                  <div className="border-t border-b border-border/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                        API Usage
                      </h3>
                      <Link
                        href="/profile?tab=api-keys"
                        className="text-xs text-primary hover:underline flex items-center"
                      >
                        Details
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(apiUsage).map(([key, usage]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground capitalize">
                              {key === "urls"
                                ? "URLs Shortened"
                                : key === "qrCodes"
                                  ? "QR Codes Generated"
                                  : "API Calls"}
                            </span>
                            <span className="text-muted-foreground font-medium">
                              {usage.used.toLocaleString()} /{" "}
                              {usage.total.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={usage.percent} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive cursor-pointer px-3 py-2.5 rounded-md hover:bg-destructive/10"
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
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[350px] p-0 glass-effect"
            >
              <div className="flex flex-col h-full">
                {/* Header with logo */}
                <div className="border-b border-border/50 p-4 flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold mr-3">
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
                          className={`flex items-center px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon
                            className={`mr-3 h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
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
                      className="flex items-center px-4 py-3.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
                    >
                      <Github className="mr-3 h-5 w-5" />
                      GitHub
                    </Link>
                  </div>

                  {/* User section */}
                  {isAuthenticated && (
                    <>
                      {userNavigation.length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                                  className={`flex items-center px-4 py-3.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    isActive
                                      ? "bg-primary text-primary-foreground shadow-lg"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  <Icon
                                    className={`mr-3 h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
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
                <div className="border-t border-border/50 p-6">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center px-4 py-3.5 rounded-lg bg-muted/50">
                        <User className="h-5 w-5 text-muted-foreground mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-5 w-5 text-destructive" />
                        <span className="text-destructive">Logout</span>
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
