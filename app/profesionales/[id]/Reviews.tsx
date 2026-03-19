import type { Review } from "@prisma/client";

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  if (!reviews.length) {
    return <div className="text-sm text-muted-foreground">Sin reseñas aún.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Reseñas</h2>
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border bg-card p-3 text-sm shadow-sm"
          >
            <div className="font-medium">⭐ {review.rating}/5</div>
            {review.comment ? (
              <p className="mt-1 text-muted-foreground">{review.comment}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

