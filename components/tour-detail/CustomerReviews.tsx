"use client";
import { useState } from "react";

interface CategoryRating {
  label: string;
  score: number;
}

interface Review {
  author: string;
  date: string;
  text: string;
  images?: string[];
}

interface CustomerReviewsProps {
  overallRating: number;
  totalReviews: number;
  categoryRatings: CategoryRating[];
  reviews: Review[];
}

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= Math.round(score) ? "#bd8f3a" : "#e5e7eb"}
          />
        </svg>
      ))}
    </div>
  );
}

const VISIBLE_COUNT = 3;

export default function CustomerReviews({ overallRating, totalReviews, categoryRatings, reviews }: CustomerReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, VISIBLE_COUNT);

  return (
    <section className="py-6 border-b border-gray-100">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-5">Customer Reviews</h2>

      {/* Overall + categories */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl font-bold font-raleway text-primary">{overallRating.toFixed(1)}</span>
          <div>
            <StarRow score={overallRating} />
            <p className="text-xs text-gray-400 font-open-sans mt-1">Overall Rating · {totalReviews} reviews</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categoryRatings.map((cat) => (
            <div key={cat.label}>
              <div className="flex justify-between text-xs font-open-sans text-gray-500 mb-1">
                <span>{cat.label}</span>
                <span className="font-semibold text-text-primary">{cat.score.toFixed(1)}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(cat.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="flex flex-col gap-6">
        {visible.map((review, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-raleway text-sm">
                {review.author[0]}
              </div>
              <div>
                <p className="text-sm font-semibold font-raleway text-text-primary">{review.author}</p>
                <p className="text-xs text-gray-400 font-open-sans">{review.date}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 font-open-sans leading-relaxed mb-3">{review.text}</p>
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.images.map((img, j) => (
                  <img key={j} src={img} alt="review" className="w-20 h-16 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > VISIBLE_COUNT && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-5 px-5 py-2 border border-primary text-primary text-sm font-semibold font-open-sans rounded-xl hover:bg-orange-50 transition-colors"
        >
          {showAll ? "Show less" : `See all ${reviews.length} reviews`}
        </button>
      )}
    </section>
  );
}
