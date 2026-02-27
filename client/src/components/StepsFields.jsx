export default function StepsFields({ register, fields, append, remove, swap }) {
  return (
    <section>
      <label className="block text-sm font-semibold text-ink mb-2">Steps</label>
      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 items-start">
            <span className="mt-2 w-6 text-sm font-semibold text-warm-brown flex-shrink-0">
              {idx + 1}.
            </span>
            <textarea
              {...register(`steps.${idx}.body`)}
              rows={2}
              placeholder={`Describe step ${idx + 1}...`}
              className="flex-1 border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange resize-none"
            />
            <div className="flex flex-col mt-1">
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
              className="text-warm-brown hover:text-burnt-orange text-lg leading-none mt-1"
            >×</button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append({ body: '' })}
        className="mt-2 text-sm text-burnt-orange hover:text-burnt-orange-dark font-medium"
      >
        + Add Step
      </button>
    </section>
  );
}
