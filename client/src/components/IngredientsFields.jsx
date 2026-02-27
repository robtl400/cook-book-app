export default function IngredientsFields({ register, fields, append, remove, swap }) {
  return (
    <section>
      <label className="block text-sm font-semibold text-ink mb-2">Ingredients</label>
      <div className="space-y-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input
              {...register(`ingredients.${idx}.quantity`)}
              placeholder="Qty"
              className="w-16 border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
            />
            <input
              {...register(`ingredients.${idx}.unit`)}
              placeholder="Unit"
              className="w-20 border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
            />
            <input
              {...register(`ingredients.${idx}.name`)}
              placeholder="Ingredient name"
              className="flex-1 border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
            />
            <div className="flex flex-col">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => swap(idx, idx - 1)}
                className="text-warm-brown hover:text-ink text-xs px-0.5 disabled:opacity-30"
              >↑</button>
              <button
                type="button"
                disabled={idx === fields.length - 1}
                onClick={() => swap(idx, idx + 1)}
                className="text-warm-brown hover:text-ink text-xs px-0.5 disabled:opacity-30"
              >↓</button>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-warm-brown hover:text-burnt-orange text-lg leading-none"
            >×</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append({ quantity: '', unit: '', name: '' })}
        className="mt-2 text-sm text-burnt-orange hover:text-burnt-orange-dark font-medium"
      >
        + Add Ingredient
      </button>
    </section>
  );
}
