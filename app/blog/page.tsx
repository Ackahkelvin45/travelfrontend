"use client";
import { useState } from "react";
import BlogCard from "@/components/blog/BlogCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import FeaturedPost from "@/components/blog/FeaturedPost";
import { useGetBlogsQuery, type Blog } from "@/lib/api/blogApi";

const SORT_OPTIONS = ["Newest First", "Most Popular", "Oldest First"];
const PER_PAGE = 6;

const SORT_TO_ORDERING: Record<string, string> = {
  "Newest First": "-published_at",
  "Oldest First": "published_at",
  "Most Popular": "-views",
};

const mapBlog = (blog: Blog) => ({
  id: blog.id,
  image: blog.cover_image?.image ?? "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
  category: blog.category_display || blog.category,
  title: blog.title,
  excerpt: blog.excerpt,
  author: blog.author_name || "Azura Travels",
  authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  date: new Date(blog.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  readTime: "5 min read",
  tags: blog.tags,
});



const FEATURED_POST = {
  id: "discover-the-magic-of-the-serengeti",
  image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&q=85",
  category: "Safari & Wildlife",
  title: "Discover the Magic of the Serengeti: A First-Timer's Complete Guide",
  excerpt:
    "From witnessing the Great Migration to sleeping under a blanket of stars, the Serengeti offers an experience unlike anywhere else on earth. Here's everything you need to know before you go.",
  author: "Amara Johnson",
  authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  date: "Apr 28, 2026",
  readTime: "8 min read",
};

export default function BlogPage() {
  const [sort, setSort] = useState("Newest First");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");

  const { data, isLoading, isError, isFetching } = useGetBlogsQuery({
    page,
    page_size: PER_PAGE,
    ordering: SORT_TO_ORDERING[sort],
    search: search || undefined,
    category: category || undefined,
    tag: tag || undefined,
  });

  const blogs = data?.results ?? [];
  const totalResults = data?.count ?? 0;
  const totalPages = Math.ceil(totalResults / PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full px-4 md:px-10 mt-20 py-6 bg-[#fbfbfb] min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-1">
        <nav className="flex items-center gap-1.5 text-xs text-gray-700 font-open-sans">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>{">"}</span>
          <span className="text-text-primary">Blog</span>
        </nav>
        <p className="text-xs font-semibold font-open-sans text-gray-500 uppercase tracking-wide">
          stories from across <span className="text-text-primary font-raleway">Africa</span>
        </p>
      </div>

      <h1 className="text-3xl font-bold font-raleway text-text-primary mb-6">
        Travel Stories & Guides
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Sidebar */}
        <BlogSidebar
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          category={category}
          onCategoryChange={(val) => {
            setCategory(prev => prev === val ? "" : val); // toggle
            setPage(1);
          }}
          tag={tag}
          onTagChange={(val) => {
            setTag(prev => prev === val ? "" : val); // toggle
            setPage(1);
          }}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Featured post */}
          <FeaturedPost {...FEATURED_POST} />

          {/* Results bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <p className="text-sm font-open-sans text-gray-500">
              {isLoading ? (
                <span className="text-gray-300">Loading…</span>
              ) : (
                <>
                  <strong className="text-text-primary font-raleway">{totalResults.toLocaleString()}</strong> articles
                </>
              )}
            </p>
            <div className="flex items-center gap-2 text-sm font-open-sans text-gray-500">
              <span>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm font-semibold font-open-sans text-text-primary border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-primary bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error state */}
          {isError && (
            <div className="text-center py-16 text-gray-700 font-open-sans text-sm">
              Failed to load articles. Please try again.
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isFetching && !isError && blogs.length === 0 && (
            <div className="text-center py-16 text-gray-700 font-open-sans text-sm">
              No articles found.
            </div>
          )}

          {/* Blog cards */}
          <div className="flex flex-col gap-4">
            {(isLoading || isFetching)
              ? Array.from({ length: PER_PAGE }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row h-auto sm:h-56">
                    <div className="w-full sm:w-56 md:w-64 h-48 sm:h-auto bg-gray-200 shrink-0" />
                    <div className="flex-1 p-4 flex flex-col gap-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-20 bg-gray-200 rounded w-full mt-2" />
                    </div>
                  </div>
                ))
              : blogs.map((post) => (
                  <BlogCard key={post.slug} {...mapBlog(post)} />
                ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
              <p className="text-sm font-open-sans text-gray-500">
                Page <strong className="text-text-primary">{page}</strong> of {totalPages}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = page - 2 + i;
                  if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  p = Math.max(1, Math.min(totalPages, p));

                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-open-sans transition-colors ${
                        page === p
                          ? "bg-primary text-white font-semibold"
                          : "border border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  );
                }).filter((val, index, arr) => arr.findIndex(t => t.key === val.key) === index)}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
