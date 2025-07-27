"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  Link2,
  Upload,
  FileText,
  Info,
  Calendar,
  Plus,
  Trash2,
  BarChart3,
  QrCode,
  Edit,
  Trash,
  MoreVertical,
  History,
  ExternalLink,
  Zap,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays, isBefore } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShortenedUrl = {
  originalUrl: string;
  shortUrl: string;
  customAlias?: string;
  expiresAt?: Date;
  createdAt: Date;
  metadata?: {
    title?: string;
    tags?: string[];
    source?: string;
  };
  isDuplicate?: boolean;
};

type BulkUrlEntry = {
  id: string;
  url: string;
  alias?: string;
  expirationType: "never" | "1day" | "7days" | "30days" | "custom";
  customExpirationDate?: Date;
  metadata?: {
    title?: string;
    tags?: string[];
  };
};

type ExpirationOption = "never" | "1day" | "7days" | "30days" | "custom";

export function UrlShortenerForm() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk" | "history">(
    "single"
  );
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [showCustomAlias, setShowCustomAlias] = useState(false);
  const [showExpiration, setShowExpiration] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [expirationType, setExpirationType] =
    useState<ExpirationOption>("never");
  const [customExpirationDate, setCustomExpirationDate] = useState<
    Date | undefined
  >(addDays(new Date(), 7));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [currentEditingEntryId, setCurrentEditingEntryId] = useState<
    string | null
  >(null);
  const [enableDeduplication, setEnableDeduplication] = useState(true);

  // Metadata fields
  const [metadata, setMetadata] = useState({
    title: "",
    tags: "",
    source: "",
  });

  const [bulkEntries, setBulkEntries] = useState<BulkUrlEntry[]>([
    {
      id: crypto.randomUUID(),
      url: "",
      alias: "",
      expirationType: "never",
      customExpirationDate: undefined,
      metadata: { title: "", tags: [] },
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);
  const [historyUrls, setHistoryUrls] = useState<ShortenedUrl[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Load shortened URLs from cookies on component mount
  useEffect(() => {
    const loadShortenedUrls = () => {
      const storedUrls = document.cookie
        .split("; ")
        .find(row => row.startsWith("shortened_urls="))
        ?.split("=")[1];

      if (storedUrls) {
        try {
          const parsedUrls = JSON.parse(decodeURIComponent(storedUrls));
          setShortenedUrls(
            parsedUrls.map((url: any) => ({
              ...url,
              expiresAt: url.expiresAt ? new Date(url.expiresAt) : undefined,
              createdAt: url.createdAt ? new Date(url.createdAt) : new Date(),
            }))
          );
        } catch (error) {
          console.error("Error parsing stored URLs:", error);
        }
      }
    };

    loadShortenedUrls();
    loadHistoryFromLocalStorage();
  }, []);

  // Load history from local storage
  const loadHistoryFromLocalStorage = () => {
    try {
      const historyData = localStorage.getItem("url_shortener_history");
      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        setHistoryUrls(
          parsedHistory.map((url: any) => ({
            ...url,
            expiresAt: url.expiresAt ? new Date(url.expiresAt) : undefined,
            createdAt: url.createdAt ? new Date(url.createdAt) : new Date(),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading history from local storage:", error);
    }
  };

  // Save history to local storage
  const saveHistoryToLocalStorage = (urls: ShortenedUrl[]) => {
    try {
      const historyForStorage = urls.map(url => ({
        ...url,
        expiresAt: url.expiresAt ? url.expiresAt.toISOString() : undefined,
        createdAt: url.createdAt.toISOString(),
      }));
      localStorage.setItem(
        "url_shortener_history",
        JSON.stringify(historyForStorage)
      );
    } catch (error) {
      console.error("Error saving history to local storage:", error);
    }
  };

  // Save shortened URLs to cookies whenever they change
  useEffect(() => {
    if (shortenedUrls.length > 0) {
      try {
        // Convert Date objects to ISO strings for storage
        const urlsForStorage = shortenedUrls.map(url => ({
          ...url,
          expiresAt: url.expiresAt ? url.expiresAt.toISOString() : undefined,
          createdAt: url.createdAt.toISOString(),
        }));

        // Set cookie with 30-day expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        document.cookie = `shortened_urls=${encodeURIComponent(JSON.stringify(urlsForStorage))}; expires=${expiryDate.toUTCString()}; path=/`;
      } catch (error) {
        console.error("Error saving URLs to cookie:", error);
      }
    }
  }, [shortenedUrls]);

  // Get expiration date based on selected option
  const getExpirationDate = (
    type: ExpirationOption,
    customDate?: Date
  ): Date | undefined => {
    switch (type) {
      case "never":
        return undefined;
      case "1day":
        return addDays(new Date(), 1);
      case "7days":
        return addDays(new Date(), 7);
      case "30days":
        return addDays(new Date(), 30);
      case "custom":
        return customDate;
      default:
        return undefined;
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Please enter a valid URL with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    // Validate expiration date if set
    const expirationDate = getExpirationDate(
      expirationType,
      customExpirationDate
    );
    if (expirationDate && isBefore(expirationDate, new Date())) {
      toast({
        title: "Error",
        description: "Expiration date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call with enhanced request structure
    setTimeout(() => {
      const baseUrl = window.location.origin;
      const alias = customAlias || Math.random().toString(36).substring(2, 8);
      const shortUrl = `${baseUrl}/s/${alias}`;

      // Check for deduplication
      const isDuplicate =
        enableDeduplication &&
        historyUrls.some(existingUrl => existingUrl.originalUrl === url);

      const newUrl: ShortenedUrl = {
        originalUrl: url,
        shortUrl,
        customAlias: customAlias || undefined,
        expiresAt: expirationDate,
        createdAt: new Date(),
        metadata: {
          title: metadata.title || undefined,
          tags: metadata.tags
            ? metadata.tags
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean)
            : undefined,
          source: metadata.source || undefined,
        },
        isDuplicate,
      };

      setShortenedUrls([newUrl]);

      // Add to history
      const updatedHistory = [newUrl, ...historyUrls].slice(0, 50); // Keep last 50 items
      setHistoryUrls(updatedHistory);
      saveHistoryToLocalStorage(updatedHistory);

      setIsLoading(false);
      setUrl("");
      setCustomAlias("");
      setMetadata({ title: "", tags: "", source: "" });
      setShowSuccessCard(true);

      toast({
        title: isDuplicate ? "Duplicate URL Found!" : "Success!",
        description: isDuplicate
          ? "This URL was already shortened. Returning existing short URL."
          : "Your URL has been shortened successfully.",
      });
    }, 1000);
  };

  const addBulkEntry = () => {
    setBulkEntries([
      ...bulkEntries,
      {
        id: crypto.randomUUID(),
        url: "",
        alias: "",
        expirationType: "never",
        customExpirationDate: undefined,
        metadata: { title: "", tags: [] },
      },
    ]);
  };

  const removeBulkEntry = (id: string) => {
    if (bulkEntries.length === 1) {
      toast({
        title: "Cannot remove",
        description: "You need at least one URL entry",
      });
      return;
    }

    setBulkEntries(bulkEntries.filter(entry => entry.id !== id));
  };

  const updateBulkEntry = (
    id: string,
    field: keyof BulkUrlEntry,
    value: any
  ) => {
    setBulkEntries(
      bulkEntries.map(entry => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one URL",
        variant: "destructive",
      });
      return;
    }

    // Validate all entries
    const emptyUrls = bulkEntries.filter(entry => !entry.url.trim());
    if (emptyUrls.length > 0) {
      toast({
        title: "Error",
        description: `${emptyUrls.length} URL(s) are empty. Please fill all URL fields.`,
        variant: "destructive",
      });
      return;
    }

    // Validate URL format for all URLs
    const invalidUrls = bulkEntries.filter(entry => {
      try {
        new URL(entry.url);
        return false;
      } catch (error) {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      toast({
        title: "Error",
        description: `${invalidUrls.length} invalid URL(s) found. Please ensure all URLs include http:// or https://`,
        variant: "destructive",
      });
      return;
    }

    // Validate expiration dates
    const invalidDates = bulkEntries.filter(entry => {
      const expirationDate = getExpirationDate(
        entry.expirationType,
        entry.customExpirationDate
      );
      return expirationDate && isBefore(expirationDate, new Date());
    });

    if (invalidDates.length > 0) {
      toast({
        title: "Error",
        description: `${invalidDates.length} URL(s) have expiration dates in the past`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const baseUrl = window.location.origin;

      const shortened = bulkEntries.map(entry => {
        const alias = entry.alias || Math.random().toString(36).substring(2, 8);
        const isDuplicate =
          enableDeduplication &&
          historyUrls.some(
            existingUrl => existingUrl.originalUrl === entry.url
          );

        return {
          originalUrl: entry.url,
          shortUrl: `${baseUrl}/s/${alias}`,
          customAlias: entry.alias,
          expiresAt: getExpirationDate(
            entry.expirationType,
            entry.customExpirationDate
          ),
          createdAt: new Date(),
          metadata: entry.metadata,
          isDuplicate,
        };
      });

      setShortenedUrls(shortened);

      // Add to history
      const updatedHistory = [...shortened, ...historyUrls].slice(0, 50); // Keep last 50 items
      setHistoryUrls(updatedHistory);
      saveHistoryToLocalStorage(updatedHistory);

      setIsLoading(false);
      setShowSuccessCard(true);

      // Reset to a single empty entry
      setBulkEntries([
        {
          id: crypto.randomUUID(),
          url: "",
          alias: "",
          expirationType: "never",
          customExpirationDate: undefined,
          metadata: { title: "", tags: [] },
        },
      ]);

      const duplicateCount = shortened.filter(url => url.isDuplicate).length;
      toast({
        title: "Success!",
        description: `${shortened.length} URLs have been shortened successfully.${duplicateCount > 0 ? ` ${duplicateCount} duplicates found.` : ""}`,
      });
    }, 1500);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);

    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });

    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllToClipboard = () => {
    const allUrls = shortenedUrls.map(item => item.shortUrl).join("\n");
    navigator.clipboard.writeText(allUrls);

    toast({
      title: "Copied!",
      description: "All links copied to clipboard",
    });
  };

  const resetForm = () => {
    setShowSuccessCard(false);
    setShortenedUrls([]);
    setUrl("");
    setCustomAlias("");
    setMetadata({ title: "", tags: "", source: "" });
    setBulkEntries([
      {
        id: crypto.randomUUID(),
        url: "",
        alias: "",
        expirationType: "never",
        customExpirationDate: undefined,
        metadata: { title: "", tags: [] },
      },
    ]);
    setShowCustomAlias(false);
    setShowExpiration(false);
    setShowMetadata(false);
    setExpirationType("never");
    setCustomExpirationDate(addDays(new Date(), 7));

    // Clear the cookie
    document.cookie =
      "shortened_urls=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const formatExpirationDate = (date?: Date) => {
    if (!date) return "Never";
    return format(date, "PPP");
  };

  const formatCreationDate = (date: Date) => {
    return format(date, "MMM d, yyyy h:mm a");
  };

  const getExpirationBadge = (date?: Date) => {
    if (!date) return null;

    const now = new Date();
    const isExpired = isBefore(date, now);
    const isCloseToExpiry = !isExpired && isBefore(date, addDays(now, 3));

    if (isExpired) {
      return (
        <Badge variant="destructive" className="ml-1 text-xs">
          Expired
        </Badge>
      );
    } else if (isCloseToExpiry) {
      return (
        <Badge
          variant="outline"
          className="ml-1 text-xs bg-yellow-50 text-yellow-800 border-yellow-300"
        >
          Expiring soon
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-1 text-xs">
          Expires {format(date, "MMM d")}
        </Badge>
      );
    }
  };

  const handleViewAnalytics = (url: string) => {
    window.open(`/analytics?url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleGenerateQR = (url: string) => {
    window.open(`/qr-code?url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleEditAlias = (url: string) => {
    toast({
      title: "Edit Alias",
      description: `Editing alias for ${url}`,
    });
  };

  const handleDelete = (url: string, isHistory = false) => {
    if (isHistory) {
      // Remove from history
      const updatedHistory = historyUrls.filter(item => item.shortUrl !== url);
      setHistoryUrls(updatedHistory);
      saveHistoryToLocalStorage(updatedHistory);
    } else {
      // Remove from current URLs
      const updatedUrls = shortenedUrls.filter(item => item.shortUrl !== url);
      setShortenedUrls(updatedUrls);

      // If no URLs left, clear the cookie
      if (updatedUrls.length === 0) {
        document.cookie =
          "shortened_urls=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }

    toast({
      title: "Delete",
      description: `Deleted ${url}`,
      variant: "destructive",
    });
  };

  const clearAllHistory = () => {
    setHistoryUrls([]);
    localStorage.removeItem("url_shortener_history");

    toast({
      title: "History Cleared",
      description: "All your URL history has been cleared",
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (currentEditingEntryId) {
      // For bulk entries
      updateBulkEntry(currentEditingEntryId, "customExpirationDate", date);
      setCurrentEditingEntryId(null);
    } else {
      // For single URL
      setCustomExpirationDate(date);
    }
    setDatePickerOpen(false);
  };

  const openDatePicker = (entryId?: string) => {
    if (entryId) {
      setCurrentEditingEntryId(entryId);
    } else {
      setCurrentEditingEntryId(null);
    }
    setDatePickerOpen(true);
  };

  const renderUrlTable = (urls: ShortenedUrl[], isHistory = false) => {
    return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="min-w-[200px]">Original URL</TableHead>
              <TableHead className="min-w-[200px]">Short URL</TableHead>
              <TableHead className="min-w-[150px]">
                {isHistory ? "Created" : "Status"}
              </TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell
                  className="max-w-[300px] truncate"
                  title={item.originalUrl}
                >
                  <div>
                    <div className="font-medium">{item.originalUrl}</div>
                    {item.metadata?.title && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.metadata.title}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.shortUrl}</span>
                    {item.customAlias && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        Custom
                      </Badge>
                    )}
                    {item.isDuplicate && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        Duplicate
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isHistory ? (
                      <span className="text-sm">
                        {formatCreationDate(item.createdAt)}
                      </span>
                    ) : (
                      <>
                        <span className="text-sm">
                          {formatExpirationDate(item.expiresAt)}
                        </span>
                        {getExpirationBadge(item.expiresAt)}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(item.shortUrl)}
                      title="Copy to clipboard"
                    >
                      {copied === item.shortUrl ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                          className="flex items-center py-3 cursor-pointer"
                          onClick={() => window.open(item.shortUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-3" />
                          <span>Open Link</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center py-3 cursor-pointer"
                          onClick={() => handleViewAnalytics(item.shortUrl)}
                        >
                          <BarChart3 className="h-4 w-4 mr-3" />
                          <span>View Analytics</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center py-3 cursor-pointer"
                          onClick={() => handleGenerateQR(item.shortUrl)}
                        >
                          <QrCode className="h-4 w-4 mr-3" />
                          <span>Generate QR Code</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="flex items-center py-3 cursor-pointer"
                          onClick={() => handleEditAlias(item.shortUrl)}
                        >
                          <Edit className="h-4 w-4 mr-3" />
                          <span>Edit Alias</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center py-3 cursor-pointer text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(item.shortUrl, isHistory)}
                        >
                          <Trash className="h-4 w-4 mr-3" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Date Picker Dialog */}
      <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Expiration Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CalendarComponent
              mode="single"
              selected={
                currentEditingEntryId
                  ? bulkEntries.find(e => e.id === currentEditingEntryId)
                      ?.customExpirationDate
                  : customExpirationDate
              }
              onSelect={handleDateSelect}
              initialFocus
              disabled={date => isBefore(date, new Date())}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessCard} onOpenChange={setShowSuccessCard}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5" />
              URLs Shortened Successfully!
            </DialogTitle>
            <DialogDescription>
              {shortenedUrls.length === 1
                ? "Your shortened URL is ready to share"
                : `${shortenedUrls.length} shortened URLs are ready to share`}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-auto">
            {renderUrlTable(shortenedUrls)}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Your links are saved in your browser and accessible from the "My
                Links" tab.
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowSuccessCard(false)}
              >
                Shorten More URLs
              </Button>
              {shortenedUrls.length > 1 && (
                <Button variant="default" onClick={copyAllToClipboard}>
                  Copy All URLs
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-2 shadow-lg">
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={value =>
              setActiveTab(value as "single" | "bulk" | "history")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="single" className="gap-2">
                <Link2 className="h-4 w-4" />
                Single URL
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </TabsTrigger>
              <TabsTrigger value="history" className="relative gap-2">
                <History className="h-4 w-4" />
                My Links
                {historyUrls.length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {historyUrls.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-0">
              <form onSubmit={handleSingleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex w-full items-center space-x-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Link2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="url"
                        className="pl-10 h-12"
                        placeholder="Paste your long URL here (e.g., https://example.com/very-long-url)"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 px-8"
                    >
                      {isLoading ? "Shortening..." : "Shorten URL"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="custom-alias"
                      checked={showCustomAlias}
                      onCheckedChange={checked =>
                        setShowCustomAlias(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="custom-alias"
                      className="text-sm font-normal"
                    >
                      Custom alias
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="set-expiration"
                      checked={showExpiration}
                      onCheckedChange={checked =>
                        setShowExpiration(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="set-expiration"
                      className="text-sm font-normal"
                    >
                      Set expiration
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="add-metadata"
                      checked={showMetadata}
                      onCheckedChange={checked =>
                        setShowMetadata(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="add-metadata"
                      className="text-sm font-normal"
                    >
                      Add metadata
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-deduplication"
                      checked={enableDeduplication}
                      onCheckedChange={checked =>
                        setEnableDeduplication(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="enable-deduplication"
                      className="text-sm font-normal"
                    >
                      Enable deduplication
                    </Label>
                  </div>
                </div>

                {showCustomAlias && (
                  <div className="space-y-2">
                    <Label htmlFor="alias" className="text-sm font-medium">
                      Custom alias
                    </Label>
                    <Input
                      id="alias"
                      placeholder="my-custom-link"
                      value={customAlias}
                      onChange={e => setCustomAlias(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your URL will be: {window.location.origin}/s/
                      {customAlias || "your-alias"}
                    </p>
                  </div>
                )}

                {showExpiration && (
                  <div className="space-y-2">
                    <Label htmlFor="expiration" className="text-sm font-medium">
                      Expiration
                    </Label>
                    <Select
                      value={expirationType}
                      onValueChange={value =>
                        setExpirationType(value as ExpirationOption)
                      }
                    >
                      <SelectTrigger id="expiration">
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never expires</SelectItem>
                        <SelectItem value="1day">1 day</SelectItem>
                        <SelectItem value="7days">7 days</SelectItem>
                        <SelectItem value="30days">30 days</SelectItem>
                        <SelectItem value="custom">Custom date</SelectItem>
                      </SelectContent>
                    </Select>

                    {expirationType === "custom" && (
                      <div className="pt-2">
                        <Label
                          htmlFor="custom-date"
                          className="text-sm font-medium mb-1 block"
                        >
                          Custom expiration date
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-transparent"
                          id="custom-date"
                          onClick={() => openDatePicker()}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {customExpirationDate
                            ? format(customExpirationDate, "PPP")
                            : "Select a date"}
                        </Button>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {expirationType === "never"
                        ? "Your link will never expire"
                        : `Your link will expire on ${formatExpirationDate(getExpirationDate(expirationType, customExpirationDate))}`}
                    </p>
                  </div>
                )}

                {showMetadata && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <Label className="text-sm font-medium">Metadata</Label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm">
                          Title (optional)
                        </Label>
                        <Input
                          id="title"
                          placeholder="Link title"
                          value={metadata.title}
                          onChange={e =>
                            setMetadata({ ...metadata, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="source" className="text-sm">
                          Source (optional)
                        </Label>
                        <Input
                          id="source"
                          placeholder="e.g., twitter, email, campaign"
                          value={metadata.source}
                          onChange={e =>
                            setMetadata({ ...metadata, source: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-sm">
                        Tags (optional)
                      </Label>
                      <Input
                        id="tags"
                        placeholder="marketing, campaign, social (comma-separated)"
                        value={metadata.tags}
                        onChange={e =>
                          setMetadata({ ...metadata, tags: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="bulk" className="mt-0">
              <form onSubmit={handleBulkSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Add multiple URLs</h3>
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {bulkEntries.length} URLs
                  </Badge>
                </div>

                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-6">
                    {bulkEntries.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="p-4 border rounded-md relative"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeBulkEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove URL</span>
                        </Button>

                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor={`url-${entry.id}`}
                              className="text-sm font-medium"
                            >
                              URL {index + 1}
                            </Label>
                            <div className="relative mt-1">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input
                                id={`url-${entry.id}`}
                                className="pl-9"
                                placeholder="https://example.com/page"
                                value={entry.url}
                                onChange={e =>
                                  updateBulkEntry(
                                    entry.id,
                                    "url",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor={`alias-${entry.id}`}
                                className="text-sm font-medium"
                              >
                                Custom alias (optional)
                              </Label>
                              <Input
                                id={`alias-${entry.id}`}
                                className="mt-1"
                                placeholder="my-custom-link"
                                value={entry.alias || ""}
                                onChange={e =>
                                  updateBulkEntry(
                                    entry.id,
                                    "alias",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div>
                              <Label
                                htmlFor={`expiration-${entry.id}`}
                                className="text-sm font-medium"
                              >
                                Expiration
                              </Label>
                              <Select
                                value={entry.expirationType}
                                onValueChange={value =>
                                  updateBulkEntry(
                                    entry.id,
                                    "expirationType",
                                    value as ExpirationOption
                                  )
                                }
                              >
                                <SelectTrigger
                                  id={`expiration-${entry.id}`}
                                  className="mt-1"
                                >
                                  <SelectValue placeholder="Select expiration" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="never">
                                    Never expires
                                  </SelectItem>
                                  <SelectItem value="1day">1 day</SelectItem>
                                  <SelectItem value="7days">7 days</SelectItem>
                                  <SelectItem value="30days">
                                    30 days
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Custom date
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {entry.expirationType === "custom" && (
                            <div>
                              <Label
                                htmlFor={`custom-date-${entry.id}`}
                                className="text-sm font-medium"
                              >
                                Custom expiration date
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal mt-1 bg-transparent"
                                id={`custom-date-${entry.id}`}
                                onClick={() => openDatePicker(entry.id)}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {entry.customExpirationDate
                                  ? format(entry.customExpirationDate, "PPP")
                                  : "Select a date"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={addBulkEntry}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Another URL
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    {isLoading ? (
                      "Processing URLs..."
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Shorten All URLs
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Your shortened URLs history
                  </h3>
                  {historyUrls.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllHistory}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Clear History
                    </Button>
                  )}
                </div>

                {historyUrls.length > 0 ? (
                  <div className="h-[400px] overflow-auto border rounded-md">
                    {renderUrlTable(historyUrls, true)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No shortened URLs yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      When you shorten URLs, they will appear here so you can
                      access them later, even if you close your browser.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 bg-transparent"
                      onClick={() => setActiveTab("single")}
                    >
                      Shorten a URL Now
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default UrlShortenerForm;
