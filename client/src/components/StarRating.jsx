import { useState } from 'react';

/**
 * StarRating — display or input mode.
 * Props:
 *   value: number (1–5)
 *   onChange: function (optional; if absent → display/read-only mode)
 *   size: 'sm' | 'md' (default 'md')
 */
export default function StarRating({ value = 0, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const isInput = typeof onChange === 'function';
  const sizeClass = size === 'sm' ? 'text-base' : 'text-xl';
  const display = isInput ? (hovered || value) : value;

  if (!isInput) {
    return (
      <span className={`inline-flex gap-0.5 ${sizeClass}`} aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= value ? 'text-burnt-orange' : 'text-warm-tan'}
          >
            {star <= value ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex gap-0.5 ${sizeClass}`}
      aria-label={`Rating: ${value} out of 5`}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`transition-colors ${
            star <= display ? 'text-burnt-orange' : 'text-warm-tan hover:text-burnt-orange'
          }`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          {star <= display ? '★' : '☆'}
        </button>
      ))}
    </span>
  );
}
