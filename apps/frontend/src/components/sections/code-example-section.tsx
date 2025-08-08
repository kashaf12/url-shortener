import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Terminal } from "lucide-react";

export function CodeExampleSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-6">
            Developer Experience
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Integrate URL shortening in your React app with just a few lines of
            code.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="glass-effect hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <Code2 className="h-5 w-5" />
                  </div>
                  React Hook Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-foreground">
                    {`import { useShortener } from '@url-shortener/react';

function MyComponent() {
  const { shorten, loading, data, error } = useShortener({
    baseUrl: 'https://your-domain.com'
  });

  const handleShorten = async () => {
    await shorten({
      url: 'https://example.com/very-long-url',
      metadata: {
        title: 'My Link',
        tags: ['marketing', 'campaign']
      }
    });
  };

  return (
    <div>
      <button onClick={handleShorten} disabled={loading}>
        {loading ? 'Shortening...' : 'Shorten URL'}
      </button>
      {data && <p>Short URL: {data.short_url}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect hover:shadow-2xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Terminal className="h-5 w-5" />
                  </div>
                  REST API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-card border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-foreground">
                    {`curl -X POST https://api.your-domain.com/shorten \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "custom_slug": "my-link",
    "metadata": {
      "title": "My Link",
      "tags": ["marketing", "campaign"],
      "user_name": "john_doe"
    },
    "deduplicate": true
  }'

# Response
{
  "short_url": "https://your-domain.com/my-link",
  "slug": "my-link",
  "url": "https://example.com/very-long-url",
  "metadata": { ... },
  "created_at": "2024-01-15T10:30:00Z",
  "is_duplicate": false
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
