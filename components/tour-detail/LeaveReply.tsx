"use client";
import { useState } from "react";
import { useSubmitPackageReviewMutation } from "@/lib/api/packagesApi";

interface LeaveReplyProps {
  packageId: string;
  bookingReference?: string;
}

export default function LeaveReply({ packageId, bookingReference: initialBookingRef = "" }: LeaveReplyProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [title, setTitle] = useState("");
  const [bookingReference, setBookingReference] = useState(initialBookingRef);
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [submitReview, { isLoading, error }] = useSubmitPackageReviewMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;

    try {
      await submitReview({
        packageId,
        body: {
          reviewer_name: reviewerName,
          reviewer_email: reviewerEmail,
          rating,
          title: title || undefined,
          body,
          booking_reference: bookingReference || undefined,
        },
      }).unwrap();

      setSubmitted(true);
      setRating(0);
      setReviewerName("");
      setReviewerEmail("");
      setTitle("");
      setBody("");
      setBookingReference("");
    } catch {
      // error displayed via `error` from the mutation
    }
  }

  return (
    <section className="py-6 border-b border-gray-100">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-1">Leave a Reply</h2>
      <p className="text-xs text-gray-700 font-open-sans mb-5">
        Your email address will not be published. Required fields are marked *
      </p>

      {submitted && (
        <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-open-sans">
          Thank you! Your review has been submitted.
        </div>
      )}

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-open-sans">
          Something went wrong. Please try again.
        </div>
      )}

      {/* Star rating picker */}
      <div className="mb-5">
        <p className="text-sm font-semibold font-raleway text-text-primary mb-2">
          Your Rating *{!rating && <span className="text-red-400 ml-1 text-xs font-normal">(required)</span>}
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-700">Full Name *</label>
          <input
            type="text"
            required
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="Jane Doe"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-700">Email *</label>
          <input
            type="email"
            required
            value={reviewerEmail}
            onChange={e => setReviewerEmail(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="jane@example.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-700"> Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
            placeholder="Amazing experience!"
          />
        </div>


        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-semibold font-open-sans text-gray-700">Body *</label>
          <textarea
            required
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors resize-none"
            placeholder="The guide was knowledgeable and..."
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading || !rating}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold font-raleway text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting…" : "Post Review"}
          </button>
        </div>
      </form>
    </section>
  );
}
