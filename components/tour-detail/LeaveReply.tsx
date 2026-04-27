"use client";
import { useState } from "react";

export default function LeaveReply() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <section className="py-6 border-b border-gray-100">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-1">Leave a Reply</h2>
      <p className="text-xs text-gray-400 font-open-sans mb-5">
        Your email address will not be published. Required fields are marked *
      </p>

      {/* Star rating picker */}
      <div className="mb-5">
        <p className="text-sm font-semibold font-raleway text-text-primary mb-2">Your Opinion *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="transition-transform hover:scale-110"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={i <= (hover || rating) ? "#bd8f3a" : "#e5e7eb"}
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-600">First Name *</label>
          <input
            type="text"
            required
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="First Name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-600">Last Name</label>
          <input
            type="text"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="Last Name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-600">Phone</label>
          <input
            type="tel"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="Phone"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-600">Email *</label>
          <input
            type="email"
            required
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="Email"
          />
        </div>
      
        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-600">Comment *</label>
          <textarea
            required
            rows={4}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors resize-none"
            placeholder="Write your comment..."
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold font-raleway text-sm hover:bg-primary/90 transition-colors"
          >
            Post Comment
          </button>
        </div>
      </form>
    </section>
  );
}
