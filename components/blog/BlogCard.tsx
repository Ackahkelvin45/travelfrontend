import Link from "next/link";

interface BlogCardProps {
 id: string;
 image: string;
 category: string;
 title: string;
 excerpt: string;
 author: string;
 authorImage: string;
 date: string;
 readTime: string;
 tags?: string[];
}

export default function BlogCard({
 id, image, category, title, excerpt, author, authorImage, date, readTime, tags,
}: BlogCardProps) {
 return (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
 {/* Image */}
 <div className="relative w-full sm:w-56 md:w-64 h-48 sm:h-56 shrink-0">
 <img src={image} alt={title} className="w-full h-full object-cover" />
 <span className="absolute top-3 left-3 text-xs font-bold font-open-sans px-2.5 py-1 rounded-full bg-primary text-white">
 {category}
 </span>
 </div>

 {/* Content */}
 <div className="flex flex-col sm:flex-row flex-1 p-4 gap-4">
 <div className="flex flex-col flex-1 gap-1.5">
 <Link
 href={`/blog/${id}`}
 className="text-base font-bold font-raleway text-text-primary leading-snug hover:text-primary transition-colors line-clamp-2"
 >
 {title}
 </Link>

 {/* Author row */}
 <div className="flex items-center gap-2">
 <img src={authorImage} alt={author} className="w-6 h-6 rounded-full object-cover" />
 <span className="text-xs font-open-sans text-gray-500">{author}</span>
 <span className="text-gray-300">·</span>
 <span className="text-xs font-open-sans text-gray-700">{date}</span>
 </div>

 <p className="text-xs text-gray-500 font-open-sans leading-relaxed line-clamp-3">{excerpt}</p>

 {tags && tags.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-1">
 {tags.map((tag) => (
 <span key={tag} className="text-xs font-open-sans text-primary border border-primary/40 px-2.5 py-0.5 rounded-full">
 {tag}
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Read time + CTA */}
 <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 min-w-28">
 <div className="flex items-center gap-1 text-xs font-open-sans text-gray-700">
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="10" />
 <polyline points="12 6 12 12 16 14" />
 </svg>
 {readTime}
 </div>
 <Link
 href={`/blog/${id}`}
 className="mt-1 px-4 py-2 border border-primary text-primary text-xs font-semibold font-open-sans rounded-xl hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
 >
 Read Article
 </Link>
 </div>
 </div>
 </div>
 );
}
