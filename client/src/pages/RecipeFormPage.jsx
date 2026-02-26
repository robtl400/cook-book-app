import { useParams } from 'react-router-dom';

export default function RecipeFormPage() {
  const { id } = useParams();
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-2">
        {id ? 'Edit Recipe' : 'New Recipe'}
      </h1>
      <p className="text-warm-brown">Recipe form — coming soon.</p>
    </div>
  );
}
