"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { TemplateGallery, MyTemplates } from "@/components/templates";
import { Search, LayoutGrid, FileText } from "lucide-react";

export default function TemplatesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Start with a template or browse our collection
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gallery">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="my-templates">
            <FileText className="h-4 w-4 mr-2" />
            My Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          <TemplateGallery />
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-6">
          <MyTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
