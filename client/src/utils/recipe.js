export const DEFAULT_VALUES = {
  title: '',
  description: '',
  self_rating: 0,
  cook_time_minutes: '',
  servings: '',
  difficulty: '',
  source_type: 'original',
  source_url: '',
  source_credit: '',
  source_post_id: null,
  inspo_post_id: null,
  tag_names: [],
  image_url: '',
  ingredients: [{ quantity: '', unit: '', name: '' }],
  steps: [{ body: '' }],
};

export function normalizeDifficulty(val) {
  if (!val) return '';
  const map = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  return map[val.toLowerCase()] ?? val;
}

export function mapPostToDefaults(post) {
  return {
    title: post.title ?? '',
    description: post.description ?? '',
    self_rating: post.self_rating ?? 0,
    cook_time_minutes: post.cook_time_minutes ?? '',
    servings: post.servings ?? '',
    difficulty: normalizeDifficulty(post.difficulty),
    source_type: post.source_type ?? 'original',
    source_url: post.source_url ?? '',
    source_credit: post.source_credit ?? '',
    source_post_id: post.source_post_id ?? null,
    inspo_post_id: post.inspo_post_id ?? null,
    tag_names: post.tags?.map(t => t.name) ?? [],
    image_url: post.image_url ?? '',
    ingredients: post.ingredients?.length
      ? [...post.ingredients].sort((a, b) => a.sort_order - b.sort_order).map(i => ({
          quantity: i.quantity ?? '', unit: i.unit ?? '', name: i.name,
        }))
      : [{ quantity: '', unit: '', name: '' }],
    steps: post.steps?.length
      ? [...post.steps].sort((a, b) => a.sort_order - b.sort_order).map(s => ({ body: s.body }))
      : [{ body: '' }],
  };
}

export function mapCookToDefaults(src) {
  // Use server-computed attribution (handles chain passthrough for nested cooks)
  const attribution = src.attribution ?? {};
  return {
    ...DEFAULT_VALUES,
    title: src.title ?? '',
    cook_time_minutes: src.cook_time_minutes ?? '',
    servings: src.servings ?? '',
    difficulty: normalizeDifficulty(src.difficulty),
    source_type: attribution.source_type ?? 'internal',
    source_post_id: attribution.source_post_id ?? src.id,
    source_url: attribution.source_url ?? '',
    source_credit: attribution.source_credit ?? '',
    inspo_post_id: attribution.inspo_post_id ?? null,
    tag_names: src.tags?.map(t => t.name) ?? [],
    ingredients: src.ingredients?.length
      ? [...src.ingredients].sort((a, b) => a.sort_order - b.sort_order).map(i => ({
          quantity: i.quantity ?? '', unit: i.unit ?? '', name: i.name,
        }))
      : [{ quantity: '', unit: '', name: '' }],
    steps: src.steps?.length
      ? [...src.steps].sort((a, b) => a.sort_order - b.sort_order).map(s => ({ body: s.body }))
      : [{ body: '' }],
  };
}
