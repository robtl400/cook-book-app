const TAGS = {
  cuisine: ['italian', 'mexican', 'japanese', 'american', 'mediterranean'],
  dietary: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
};

export default function TagSelector({ selectedTags, onToggle }) {
  return (
    <section>
      <label className="block text-sm font-semibold text-ink mb-2">Tags</label>
      {Object.entries(TAGS).map(([category, names]) => (
        <div key={category} className="mb-3">
          <p className="text-xs text-warm-brown capitalize mb-1.5">{category}</p>
          <div className="flex flex-wrap gap-2">
            {names.map(name => {
              const active = selectedTags?.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onToggle(name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-burnt-orange text-white border-burnt-orange'
                      : 'bg-white text-warm-brown border-warm-tan hover:border-burnt-orange'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
