"use client";

import Link from "next/link";
import { useGetBlogDetailQuery } from "@/lib/api/blogApi";
import BlogSidebar from "@/components/blog/BlogSidebar";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1400&q=85";
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80";

interface Props {
  id: string;
}

function BlogDetailSkeleton() {
  return (
    <div className="w-full px-4 md:px-10 mt-20 py-6 bg-[#fbfbfb] min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="flex-1 w-full min-w-0 animate-pulse">
          <div className="w-full h-64 md:h-120 rounded-2xl bg-gray-200 mb-8" />
          <div className="flex gap-2 mb-7">
            {[1, 2, 3].map(i => <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />)}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-4 bg-gray-100 rounded ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
          {[120, 200, 180, 150].map((h, i) => (
            <div key={i} className={`h-[${h}px] bg-gray-200 rounded-2xl animate-pulse`} style={{ height: h }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogDetailClient({ id }: Props) {
  const { data: post, isLoading, isError } = useGetBlogDetailQuery(id);

  if (isLoading) return <BlogDetailSkeleton />;

  if (isError || !post) {
    return (
      <main className="w-full px-10 mt-20 py-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 font-open-sans text-sm">
          Failed to load this article. Please go back and try again.
        </p>
      </main>
    );
  }

  const coverImage =
    (post.images.find((img) => img.is_cover) ?? post.images[0])?.image ?? FALLBACK_IMAGE;
  const authorName = post.author_name || "Azura Travels";
  const publishedDate = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="w-full px-4 md:px-10 mt-20 py-6 bg-[#fbfbfb] min-h-screen">
      {/* Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400 font-open-sans">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>{">"}</span>
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>{">"}</span>
          <span className="text-text-primary line-clamp-1 max-w-xs">{post.title}</span>
        </nav>
        <p className="text-xs font-semibold font-open-sans text-gray-500 uppercase tracking-wide">
          stories from across <span className="text-text-primary font-raleway">Africa</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Main article */}
        <article className="flex-1 min-w-0">
          {/* Hero image */}
          <div className="relative w-full h-[60vh] min-h-[300px] md:h-120 rounded-2xl overflow-hidden mb-8">
            <img
              src={coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

            <span className="absolute top-5 left-5 text-xs font-bold font-open-sans px-3 py-1 rounded-full bg-primary text-white">
              {post.category_display || post.category}
            </span>

            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h1 className="text-3xl font-bold font-raleway text-white leading-snug mb-4 max-w-3xl">
                {post.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={FALLBACK_AVATAR}
                    alt={authorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold font-open-sans text-white">{authorName}</span>
                    <span className="text-xs font-open-sans text-white/60">{publishedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-open-sans text-primary border border-primary/40 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Article body */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
            {post.excerpt && (
              <p className="text-sm font-open-sans text-gray-500 leading-relaxed mb-6 italic border-l-4 border-primary/30 pl-4">
                {post.excerpt}
              </p>
            )}
            <div
              className="prose prose-sm max-w-none font-open-sans text-gray-700 leading-7
                prose-headings:font-raleway prose-headings:text-text-primary
                prose-h2:text-lg prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-base prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-2
                prose-p:mb-5 prose-p:text-sm prose-p:leading-7
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-5
                prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:pr-4
                prose-blockquote:rounded-r-xl prose-blockquote:my-6 prose-blockquote:not-italic
                prose-blockquote:text-gray-600 prose-blockquote:text-sm
                prose-ul:flex prose-ul:flex-col prose-ul:gap-2 prose-ul:mb-5
                prose-li:text-sm prose-li:text-gray-700 prose-li:leading-6
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </div>

          {/* Author + share row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 border-t border-b border-gray-100 mb-8 gap-4">
            <div className="flex items-center gap-2">
              <img
                src={FALLBACK_AVATAR}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold font-raleway text-text-primary">{authorName}</p>
                <p className="text-xs font-open-sans text-gray-400">Travel Writer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-open-sans text-gray-400 mr-1">Share:</span>
              {[
                { label: "Twitter / X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
              ].map(({ label, path }) => (
                <button
                  key={label}
                  aria-label={`Share on ${label}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

        </article>

        {/* Sidebar */}
        <BlogSidebar />
      </div>
    </div>
  );
}
