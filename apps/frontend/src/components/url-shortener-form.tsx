"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Copy,
  ExternalLink,
  LinkIcon,
  QrCode,
  BarChart3,
  Settings,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";
import type { ShortenResponse, LinkMetadata } from "@url-shortener/types";

export function UrlShortenerForm() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [source, setSource] = useState("");
  const [deduplicate, setDeduplicate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const metadata: LinkMetadata = {};
      if (title) metadata.title = title;
      if (tags) metadata.tags = tags.split(",").map(tag => tag.trim());
      if (source) metadata.source = source;
      metadata.user_name = "demo_user";

      const requestData = {
        url: url,
        customSlug: customSlug || undefined,
        metadata,
        deduplicate: deduplicate,
        enhancedCanonical: false,
      };

      const apiResult = await apiService.shorten(requestData);
      setResult(apiResult);

      toast("URL shortened successfully!", {
        description: apiResult.wasDeduped
          ? "Existing short URL returned"
          : "New short URL created",
      });
    } catch (err) {
      console.error("API Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to shorten URL. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast("Copied to clipboard!", {
        description: `${field} has been copied to your clipboard.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast("Failed to copy", {
        description: "Please copy the text manually.",
        dismissible: true,
      });
    }
  };

  const resetForm = () => {
    setUrl("");
    setCustomSlug("");
    setTitle("");
    setTags("");
    setSource("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="glass-effect hover:shadow-2xl transition-all duration-500">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <LinkIcon className="h-6 w-6" />
            </div>
            Shorten Your URL
          </CardTitle>
          <CardDescription className="text-base md:text-lg">
            Transform long URLs into short, trackable links with advanced
            features and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium">
                    Long URL *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/very-long-url-that-needs-shortening"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customSlug" className="text-sm font-medium">
                    Custom Slug (Optional)
                  </Label>
                  <Input
                    id="customSlug"
                    placeholder="my-custom-link"
                    value={customSlug}
                    onChange={e =>
                      setCustomSlug(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for auto-generated slug
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-advanced" className="text-sm font-medium">
                    Long URL *
                  </Label>
                  <Input
                    id="url-advanced"
                    type="url"
                    placeholder="https://example.com/very-long-url-that-needs-shortening"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="h-12 text-base"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customSlug-advanced"
                      className="text-sm font-medium"
                    >
                      Custom Slug
                    </Label>
                    <Input
                      id="customSlug-advanced"
                      placeholder="my-custom-link"
                      value={customSlug}
                      onChange={e =>
                        setCustomSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      className="h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="My Awesome Link"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      placeholder="marketing, campaign, social"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      className="h-12 text-base"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate tags with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source" className="text-sm font-medium">
                      Source
                    </Label>
                    <Input
                      id="source"
                      placeholder="twitter, email, website"
                      value={source}
                      onChange={e => setSource(e.target.value)}
                      className="h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                  <Switch
                    id="deduplicate"
                    checked={deduplicate}
                    onCheckedChange={setDeduplicate}
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="deduplicate"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Enable Deduplication
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Return existing short URL if the same long URL was already
                      shortened
                    </p>
                  </div>
                </div>
              </TabsContent>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="flex-1 h-12 text-base font-semibold hover:scale-105 transition-transform duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Shortening...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Shorten URL
                    </>
                  )}
                </Button>
                {result && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="h-12 px-6 bg-transparent"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="glass-effect animate-fade-in hover:shadow-2xl transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <Check className="h-5 w-5" />
              </div>
              URL Shortened Successfully!
              {result.wasDeduped && (
                <Badge variant="secondary" className="ml-2">
                  Duplicate
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your shortened URL is ready to use. Click the buttons below to
              copy or share.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Short URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Short URL</Label>
              <div className="flex gap-2">
                <Input
                  value={result.short_url}
                  readOnly
                  className="h-12 text-base font-mono bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(result.short_url, "Short URL")}
                  className="h-12 w-12 hover:scale-110 transition-transform duration-300"
                >
                  {copiedField === "Short URL" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(result.short_url, "_blank")}
                  className="h-12 w-12 hover:scale-110 transition-transform duration-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Original URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Original URL</Label>
              <div className="flex gap-2">
                <Input
                  value={result.url}
                  readOnly
                  className="h-12 text-base bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(result.url, "Original URL")}
                  className="h-12 w-12 hover:scale-110 transition-transform duration-300"
                >
                  {copiedField === "Original URL" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            {(result.strategy || result.length || result.wasCustomSlug) && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Additional Info</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                  {result.strategy && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Strategy
                      </p>
                      <p className="text-sm font-medium">{result.strategy}</p>
                    </div>
                  )}
                  {result.length && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Length
                      </p>
                      <p className="text-sm font-medium">
                        {result.length} characters
                      </p>
                    </div>
                  )}
                  {result.wasCustomSlug && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Custom Slug
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        ✓ Used custom slug
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {result.slug.length}
                </p>
                <p className="text-xs text-muted-foreground">Slug Length</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {result.wasDeduped ? "Yes" : "No"}
                </p>
                <p className="text-xs text-muted-foreground">Duplicate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {result.wasCustomSlug ? "Yes" : "No"}
                </p>
                <p className="text-xs text-muted-foreground">Custom Slug</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 h-12 bg-transparent"
              >
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 h-12 bg-transparent"
              >
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
