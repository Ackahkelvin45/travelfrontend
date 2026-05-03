"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetBlogSidebarQuery } from "@/lib/api/blogApi";

interface BlogSidebarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  category?: string;
  onCategoryChange?: (val: string) => void;
  tag?: string;
  onTagChange?: (val: string) => void;
}

export default function BlogSidebar({
  search = "",
  onSearchChange,
  category = "",
  onCategoryChange,
  tag = "",
  onTagChange,
}: BlogSidebarProps = {}) {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(search);
  const { data, isLoading } = useGetBlogSidebarQuery();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== localSearch) {
        if (onSearchChange) {
          onSearchChange(localSearch);
        } else if (localSearch) {
          router.push(`/blog?search=${encodeURIComponent(localSearch)}`);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search, router]);

  // Sync if cleared from outside
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
      {/* Search */}
      <div className="bg-primary rounded-xl p-4">
        <p className="text-white text-xs font-semibold font-open-sans mb-3">Search Articles</p>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm font-open-sans text-text-primary placeholder-gray-700 outline-none bg-white"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold font-raleway text-text-primary mb-4">Categories</h3>
        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded-full w-6" />
              </div>
            ))
          ) : (
            data?.categories?.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  if (onCategoryChange) {
                    onCategoryChange(cat.value);
                  } else {
                    router.push(`/blog?category=${encodeURIComponent(cat.value)}`);
                  }
                }}
                className={`flex items-center justify-between text-sm font-open-sans transition-colors py-1 border-b border-gray-50 last:border-0 ${
                  category === cat.value ? "text-primary font-semibold" : "text-gray-500 hover:text-primary"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${category === cat.value ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                  {cat.count}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold font-raleway text-text-primary mb-4">Recent Posts</h3>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                <div className="flex flex-col gap-2 w-full pt-1">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : (
            data?.recent_posts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="flex items-start gap-3 group">
                <img
                  src={post.cover_image?.image ?? "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&q=80"}
                  alt={post.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold font-raleway text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs font-open-sans text-gray-700">
                    {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold font-raleway text-text-primary mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse h-6 bg-gray-100 rounded-full w-16" />
            ))
          ) : (
            data?.popular_tags?.map((tagData) => (
              <button
                key={tagData.tag}
                onClick={() => {
                  if (onTagChange) {
                    onTagChange(tagData.tag);
                  } else {
                    router.push(`/blog?tag=${encodeURIComponent(tagData.tag)}`);
                  }
                }}
                className={`text-xs font-open-sans border px-2.5 py-1 rounded-full transition-colors ${
                  tag === tagData.tag
                    ? "bg-primary text-white border-primary"
                    : "text-primary border-primary/40 hover:bg-primary hover:text-white"
                }`}
              >
                {tagData.tag}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold font-raleway text-text-primary">Stay Inspired</h3>
        <p className="text-xs font-open-sans text-gray-500 leading-relaxed">
          Get the latest travel stories and guides delivered to your inbox.
        </p>
        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full px-3 py-2 text-xs font-open-sans border border-gray-200 rounded-lg outline-none focus:border-primary bg-white"
          />
          <button className="w-full bg-primary text-white text-xs font-semibold font-montserrat py-2 rounded-lg hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </div>
      </div>
    </aside>
  );
}
