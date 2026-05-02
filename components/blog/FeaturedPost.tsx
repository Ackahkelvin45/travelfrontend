import Link from "next/link";

interface FeaturedPostProps {
  id: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
}

export default function FeaturedPost({
  id, image, category, title, excerpt, author, authorImage, date, readTime,
}: FeaturedPostProps) {
  return (
    <div className="relative w-full h-auto min-h-[400px] md:h-[420px] rounded-2xl overflow-hidden mb-6 group">
      {/* Background image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Category badge */}
      <span className="absolute top-5 left-5 text-xs font-bold font-open-sans px-3 py-1 rounded-full bg-primary text-white">
        {category}
      </span>

      {/* Featured label */}
      <span className="absolute top-5 right-5 text-xs font-semibold font-open-sans px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
        Featured
      </span>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
        <h2 className="text-2xl font-bold font-raleway text-white leading-snug max-w-2xl">
          {title}
        </h2>
        <p className="text-sm font-open-sans text-white/80 leading-relaxed line-clamp-2 max-w-xl">
          {excerpt}
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-1 gap-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <img src={authorImage} alt={author} className="w-8 h-8 rounded-full object-cover border-2 border-white/50" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold font-open-sans text-white">{author}</span>
              <span className="text-xs font-open-sans text-white/60">{date} · {readTime}</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/blog/${id}`}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold font-montserrat rounded-xl hover:opacity-90 transition-opacity"
          >
            Read Article
          </Link>
        </div>
      </div>
    </div>
  );
}
