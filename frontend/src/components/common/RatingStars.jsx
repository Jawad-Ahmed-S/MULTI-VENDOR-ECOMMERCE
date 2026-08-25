import { Star } from "lucide-react";

export default function RatingStars({ rating = 0, size = 16 }) {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= Math.round(rating)
              ? "fill-brand text-brand"
              : "text-border fill-surface-muted"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-ink-muted font-medium">
        {rating ? rating.toFixed(1) : "0.0"}
      </span>
    </div>
  );
}