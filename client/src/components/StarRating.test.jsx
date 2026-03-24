import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StarRating from './StarRating'

describe('StarRating', () => {
  describe('display mode (no onChange)', () => {
    it('renders correct filled and empty stars for value 3', () => {
      render(<StarRating value={3} />)
      const stars = screen.getAllByText(/[★☆]/)
      const filled = stars.filter(s => s.textContent === '★')
      const empty = stars.filter(s => s.textContent === '☆')
      expect(filled).toHaveLength(3)
      expect(empty).toHaveLength(2)
    })

    it('has correct aria-label', () => {
      render(<StarRating value={4} />)
      expect(screen.getByLabelText('4 out of 5 stars')).toBeTruthy()
    })
  })

  describe('input mode (with onChange)', () => {
    it('calls onChange with star value when clicked', () => {
      const onChange = vi.fn()
      render(<StarRating value={2} onChange={onChange} />)

      const star4Button = screen.getByLabelText('Rate 4 stars')
      fireEvent.click(star4Button)

      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('renders clickable buttons for each star', () => {
      const onChange = vi.fn()
      render(<StarRating value={0} onChange={onChange} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })
  })
})
