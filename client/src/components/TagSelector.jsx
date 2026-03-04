const TAGS = {
  cuisine: ['italian', 'mexican', 'japanese', 'american', 'mediterranean'],
  dietary: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
};

export default function TagSelector({ selectedTags, onToggle }) {
  return (
    <section>
      <label className="block text-sm font-semibold text-text mb-2">Tags</label>
      {Object.entries(TAGS).map(([category, names]) => (
        <div key={category} className="mb-3">
          <p className="text-xs text-text-muted capitalize mb-1.5">{category}</p>
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
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface-input text-text-muted border-border hover:border-cta'
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
