import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import StarRating from '../components/StarRating';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const TAGS = {
  cuisine: ['italian', 'mexican', 'japanese', 'american', 'mediterranean'],
  dietary: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'],
};

const DEFAULT_VALUES = {
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

function normalizeDifficulty(val) {
  if (!val) return '';
  const map = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  return map[val.toLowerCase()] ?? val;
}

function mapPostToDefaults(post) {
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

function mapCookToDefaults(src) {
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

export default function RecipeFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const mode = !id ? 'create' : location.pathname.endsWith('/cook') ? 'cook' : 'edit';

  const [pageLoading, setPageLoading] = useState(mode !== 'create');
  const [pageError, setPageError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // "I Cooked" source post (for display only)
  const [sourcePost, setSourcePost] = useState(null);
  const [cookedBoxId, setCookedBoxId] = useState(null);

  // Image state
  const [imagePreview, setImagePreview] = useState('');
  const [parsedImageUrl, setParsedImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  // URL parse state
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState('');

  // Internal source search
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceResults, setSourceResults] = useState([]);
  const [sourceSelected, setSourceSelected] = useState(null);
  const sourceTimer = useRef(null);

  // Inspo search
  const [inspoSearch, setInspoSearch] = useState('');
  const [inspoResults, setInspoResults] = useState([]);
  const [inspoSelected, setInspoSelected] = useState(null);
  const inspoTimer = useRef(null);

  const {
    register, control, handleSubmit, watch, setValue, getValues, reset,
    formState: { errors, isSubmitted },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  const {
    fields: ingFields, append: appendIng, remove: removeIng, swap: swapIng,
  } = useFieldArray({ control, name: 'ingredients' });

  const {
    fields: stepFields, append: appendStep, remove: removeStep, swap: swapStep,
  } = useFieldArray({ control, name: 'steps' });

  const watchSourceType = watch('source_type');
  const watchDescription = watch('description');
  const watchTagNames = watch('tag_names');
  const watchSourceUrl = watch('source_url');

  // ── Data fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'create') return;

    async function load() {
      try {
        if (mode === 'edit') {
          const res = await api.get(`/posts/${id}`);
          const post = res.data ?? res;
          const vals = mapPostToDefaults(post);
          reset(vals);
          if (post.image_url) setImagePreview(post.image_url);
          if (post.source_post) setSourceSelected(post.source_post);
          if (post.inspo_post) setInspoSelected(post.inspo_post);
        } else {
          // cook mode
          const res = await api.get(`/posts/recipe/cook/${id}`);
          const src = res.data ?? res;
          setSourcePost(src);
          reset(mapCookToDefaults(src));
          const fallback = src.image_url || src.parsed_image_url || '';
          if (fallback) setParsedImageUrl(fallback);

          // Find the user's "Cooked" box
          if (user?.id) {
            try {
              const boxRes = await api.get(`/users/${user.id}/boxes`);
              const boxes = boxRes.data ?? boxRes;
              const cooked = boxes.find(
                b => b.box_type === 'cooked' || b.name?.toLowerCase() === 'cooked',
              );
              if (cooked) setCookedBoxId(cooked.id);
            } catch { /* best-effort */ }
          }
        }
      } catch (err) {
        setPageError(err.message ?? 'Could not load recipe data.');
      } finally {
        setPageLoading(false);
      }
    }

    load();
  }, [mode, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Search helpers ───────────────────────────────────────────────────────
  function handleSourceSearch(q) {
    setSourceSearch(q);
    clearTimeout(sourceTimer.current);
    if (!q.trim()) { setSourceResults([]); return; }
    sourceTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search/recipes?q=${encodeURIComponent(q)}`);
        setSourceResults((res.data ?? res).slice(0, 8));
      } catch { /* ignore */ }
    }, 300);
  }

  function handleInspoSearch(q) {
    setInspoSearch(q);
    clearTimeout(inspoTimer.current);
    if (!q.trim()) { setInspoResults([]); return; }
    inspoTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/search/recipes?q=${encodeURIComponent(q)}`);
        setInspoResults((res.data ?? res).slice(0, 8));
      } catch { /* ignore */ }
    }, 300);
  }

  // ── Parse URL ────────────────────────────────────────────────────────────
  async function handleParseUrl() {
    const url = getValues('source_url');
    if (!url) return;
    setParseLoading(true);
    setParseError('');
    try {
      const res = await api.post('/parse/recipe', { url });
      const parsed = res.data ?? res;
      if (parsed.title) setValue('title', parsed.title);
      if (parsed.ingredients?.length) {
        setValue(
          'ingredients',
          parsed.ingredients.map(i => ({
            quantity: i.quantity ?? '', unit: i.unit ?? '', name: i.name,
          })),
        );
      }
      if (parsed.instructions?.length) {
        setValue('steps', parsed.instructions.map(body => ({ body })));
      }
      if (parsed.cook_time != null) setValue('cook_time_minutes', parsed.cook_time);
      if (parsed.servings != null) setValue('servings', String(parsed.servings));
      if (parsed.image_url) {
        setParsedImageUrl(parsed.image_url);
        setValue('image_url', parsed.image_url);
        setImagePreview(parsed.image_url);
      }
    } catch (err) {
      setParseError(err.message ?? 'Could not parse that URL. Fill in manually.');
    } finally {
      setParseLoading(false);
    }
  }

  // ── Image upload ─────────────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Upload failed');
      setImagePreview(json.secure_url);
      setValue('image_url', json.secure_url);
    } catch (err) {
      setImageError(err.message ?? 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  }

  function clearImage() {
    setImagePreview('');
    setValue('image_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Tag toggle ───────────────────────────────────────────────────────────
  function toggleTag(name) {
    const current = getValues('tag_names');
    setValue(
      'tag_names',
      current.includes(name) ? current.filter(t => t !== name) : [...current, name],
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function onSubmit(data) {
    if (!data.self_rating) return; // guard (handled by Controller rules too)
    setSubmitLoading(true);
    setSubmitError('');
    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        self_rating: Number(data.self_rating),
        source_type: data.source_type,
        source_url: data.source_url || undefined,
        source_credit: data.source_credit || undefined,
        source_post_id: data.source_post_id || undefined,
        inspo_post_id: data.inspo_post_id || undefined,
        image_url: data.image_url || undefined,
        cook_time_minutes: data.cook_time_minutes ? Number(data.cook_time_minutes) : undefined,
        servings: data.servings ? Number(data.servings) : undefined,
        difficulty: data.difficulty || undefined,
        tags: data.tag_names,
        ingredients: data.ingredients
          .filter(i => i.name?.trim())
          .map((ing, idx) => ({ ...ing, sort_order: idx })),
        steps: data.steps
          .filter(s => s.body?.trim())
          .map((s, idx) => ({ body: s.body, sort_order: idx })),
      };

      let newPost;
      if (mode === 'edit') {
        const res = await api.patch(`/posts/${id}`, payload);
        newPost = res.data ?? res;
      } else {
        const res = await api.post('/posts/recipe', payload);
        newPost = res.data ?? res;
        // Auto-save to Cooked box in cook mode
        if (mode === 'cook' && cookedBoxId) {
          try {
            await api.post(`/posts/${newPost.id}/save`, { box_id: cookedBoxId });
          } catch { /* best-effort */ }
        }
      }

      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to save recipe. Please try again.');
      setSubmitLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-burnt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500">{pageError}</p>
      </div>
    );
  }

  const modeLabel = mode === 'cook' ? 'I Cooked This' : mode === 'edit' ? 'Edit Recipe' : 'New Recipe';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-ink mb-1">{modeLabel}</h1>
      {mode === 'cook' && sourcePost && (
        <p className="text-warm-brown mb-6 text-sm">
          Based on <span className="font-semibold">{sourcePost.title}</span>
          {sourcePost.user?.display_name && (
            <> by {sourcePost.user.display_name}</>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">

        {/* ── Title ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-1">
            Title <span className="text-burnt-orange">*</span>
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full border border-warm-tan rounded-lg px-3 py-2 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-burnt-orange"
            placeholder="Give your recipe a name"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </section>

        {/* ── Description ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-1">Description</label>
          <textarea
            {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
            rows={3}
            maxLength={500}
            className="w-full border border-warm-tan rounded-lg px-3 py-2 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-burnt-orange resize-none"
            placeholder="What makes this recipe special?"
          />
          <p className="text-xs text-warm-brown text-right mt-0.5">
            {watchDescription?.length ?? 0}/500
          </p>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </section>

        {/* ── Ingredients ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">Ingredients</label>
          <div className="space-y-2">
            {ingFields.map((field, idx) => (
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
                    onClick={() => swapIng(idx, idx - 1)}
                    className="text-warm-brown hover:text-ink text-xs px-0.5 disabled:opacity-30"
                  >↑</button>
                  <button
                    type="button"
                    disabled={idx === ingFields.length - 1}
                    onClick={() => swapIng(idx, idx + 1)}
                    className="text-warm-brown hover:text-ink text-xs px-0.5 disabled:opacity-30"
                  >↓</button>
                </div>
                <button
                  type="button"
                  onClick={() => removeIng(idx)}
                  className="text-warm-brown hover:text-burnt-orange text-lg leading-none"
                >×</button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => appendIng({ quantity: '', unit: '', name: '' })}
            className="mt-2 text-sm text-burnt-orange hover:text-burnt-orange-dark font-medium"
          >
            + Add Ingredient
          </button>
        </section>

        {/* ── Steps ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">Steps</label>
          <div className="space-y-3">
            {stepFields.map((field, idx) => (
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
                    onClick={() => swapStep(idx, idx - 1)}
                    className="text-warm-brown hover:text-ink text-xs px-0.5 disabled:opacity-30"
                  >↑</button>
                  <button
                    type="button"
                    disabled={idx === stepFields.length - 1}
                    onClick={() => swapStep(idx, idx + 1)}
                    className="text-warm-brown hover:text-ink text-xs px-0.5 disabled:opacity-30"
                  >↓</button>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="text-warm-brown hover:text-burnt-orange text-lg leading-none mt-1"
                >×</button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => appendStep({ body: '' })}
            className="mt-2 text-sm text-burnt-orange hover:text-burnt-orange-dark font-medium"
          >
            + Add Step
          </button>
        </section>

        {/* ── Attribution ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">Recipe Source</label>

          {mode === 'cook' ? (
            <div className="bg-cream-dark rounded-lg p-3 text-sm text-warm-brown">
              <span className="font-medium">Based on:</span>{' '}
              {sourcePost?.title ?? `Post #${id}`}
              {sourcePost?.user?.display_name && (
                <span> by {sourcePost.user.display_name}</span>
              )}
            </div>
          ) : (
            <>
              {/* Source type selector */}
              <div className="flex flex-wrap gap-4 mb-3">
                {[
                  { value: 'original', label: 'Original Recipe' },
                  { value: 'external', label: 'External URL' },
                  { value: 'internal', label: 'CookBook Recipe' },
                  { value: 'credit', label: 'Plain Text Credit' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('source_type')}
                      className="accent-burnt-orange"
                    />
                    <span className="text-sm text-ink">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* External URL */}
              {watchSourceType === 'external' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      {...register('source_url')}
                      placeholder="https://..."
                      className="flex-1 border border-warm-tan rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
                    />
                    <button
                      type="button"
                      onClick={handleParseUrl}
                      disabled={parseLoading || !watchSourceUrl}
                      className="px-3 py-2 bg-burnt-orange text-white text-sm rounded hover:bg-burnt-orange-dark disabled:opacity-50 whitespace-nowrap"
                    >
                      {parseLoading ? 'Parsing…' : 'Parse Recipe'}
                    </button>
                  </div>
                  {parseError && <p className="text-red-500 text-sm">{parseError}</p>}
                  {parsedImageUrl && !imagePreview && (
                    <img
                      src={parsedImageUrl}
                      alt="Parsed recipe"
                      className="h-32 w-full object-cover rounded"
                    />
                  )}
                </div>
              )}

              {/* CookBook recipe search */}
              {watchSourceType === 'internal' && (
                <div className="relative">
                  <input
                    value={sourceSelected ? sourceSelected.title : sourceSearch}
                    onChange={e => {
                      setSourceSelected(null);
                      setValue('source_post_id', null);
                      handleSourceSearch(e.target.value);
                    }}
                    placeholder="Search CookBook recipes…"
                    className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
                  />
                  {sourceResults.length > 0 && !sourceSelected && (
                    <ul className="absolute z-10 w-full bg-white border border-warm-tan rounded mt-1 shadow-lg max-h-44 overflow-y-auto">
                      {sourceResults.map(r => (
                        <li key={r.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-cream-dark"
                            onClick={() => {
                              setSourceSelected(r);
                              setValue('source_post_id', r.id);
                              setSourceResults([]);
                              setSourceSearch('');
                            }}
                          >
                            {r.title}
                            {r.user?.display_name && (
                              <span className="text-warm-brown"> — {r.user.display_name}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Plain text credit */}
              {watchSourceType === 'credit' && (
                <input
                  {...register('source_credit')}
                  placeholder="e.g. Alison Roman — Nothing Fancy, p. 42"
                  className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
                />
              )}
            </>
          )}

          {/* Inspo field */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-warm-brown mb-1">
              Inspiration (optional)
            </label>
            {mode === 'cook' ? (
              <p className="text-sm text-warm-brown italic">Inspiration from the original post.</p>
            ) : (
              <div className="relative">
                <input
                  value={inspoSelected ? inspoSelected.title : inspoSearch}
                  onChange={e => {
                    setInspoSelected(null);
                    setValue('inspo_post_id', null);
                    handleInspoSearch(e.target.value);
                  }}
                  placeholder="Link to an inspiring recipe on CookBook…"
                  className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
                />
                {inspoResults.length > 0 && !inspoSelected && (
                  <ul className="absolute z-10 w-full bg-white border border-warm-tan rounded mt-1 shadow-lg max-h-44 overflow-y-auto">
                    {inspoResults.map(r => (
                      <li key={r.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-cream-dark"
                          onClick={() => {
                            setInspoSelected(r);
                            setValue('inspo_post_id', r.id);
                            setInspoResults([]);
                            setInspoSearch('');
                          }}
                        >
                          {r.title}
                          {r.user?.display_name && (
                            <span className="text-warm-brown"> — {r.user.display_name}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Image ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">Photo</label>

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Recipe photo preview"
                className="w-full h-52 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-base hover:bg-black/80"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              {mode === 'cook' && parsedImageUrl && (
                <div className="relative mb-2">
                  <img
                    src={parsedImageUrl}
                    alt="Source recipe"
                    className="w-full h-52 object-cover rounded-lg opacity-50"
                  />
                  <p className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-1 rounded">
                    Upload your own photo to replace this.
                  </p>
                </div>
              )}

              {CLOUD_NAME && UPLOAD_PRESET ? (
                <div
                  className="border-2 border-dashed border-warm-tan rounded-lg p-8 text-center cursor-pointer hover:border-burnt-orange transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-warm-brown">Uploading…</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-warm-brown text-sm">Drop an image here or click to upload</p>
                      <p className="text-xs text-warm-tan mt-1">JPG, PNG, WEBP</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                /* Fallback: plain URL input if Cloudinary not configured */
                <input
                  {...register('image_url')}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full border border-warm-tan rounded px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
                />
              )}
              {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
            </>
          )}
        </section>

        {/* ── Self-rating ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">
            Your Rating <span className="text-burnt-orange">*</span>
          </label>
          <Controller
            name="self_rating"
            control={control}
            rules={{ validate: v => v >= 1 || 'Please rate this recipe' }}
            render={({ field }) => (
              <StarRating value={field.value} onChange={field.onChange} size="md" />
            )}
          />
          {errors.self_rating && (
            <p className="text-red-500 text-sm mt-1">{errors.self_rating.message}</p>
          )}
        </section>

        {/* ── Metadata ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">Details</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-warm-brown mb-1">Cook Time (min)</label>
              <input
                {...register('cook_time_minutes', { min: { value: 0, message: 'Must be ≥ 0' } })}
                type="number"
                min="0"
                placeholder="45"
                className="w-full border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
              />
            </div>
            <div>
              <label className="block text-xs text-warm-brown mb-1">Servings</label>
              <input
                {...register('servings', { min: { value: 1, message: 'Must be ≥ 1' } })}
                type="number"
                min="1"
                placeholder="4"
                className="w-full border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
              />
            </div>
            <div>
              <label className="block text-xs text-warm-brown mb-1">Difficulty</label>
              <select
                {...register('difficulty')}
                className="w-full border border-warm-tan rounded px-2 py-1.5 text-sm text-ink bg-white focus:outline-none focus:ring-1 focus:ring-burnt-orange"
              >
                <option value="">—</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Tags ── */}
        <section>
          <label className="block text-sm font-semibold text-ink mb-2">Tags</label>
          {Object.entries(TAGS).map(([category, names]) => (
            <div key={category} className="mb-3">
              <p className="text-xs text-warm-brown capitalize mb-1.5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {names.map(name => {
                  const active = watchTagNames?.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleTag(name)}
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

        {/* ── Submit ── */}
        {submitError && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-3 bg-burnt-orange text-white font-semibold rounded-lg hover:bg-burnt-orange-dark disabled:opacity-50 transition-colors"
        >
          {submitLoading
            ? 'Saving…'
            : mode === 'edit'
            ? 'Save Changes'
            : mode === 'cook'
            ? 'Post My Cook'
            : 'Publish Recipe'}
        </button>
      </form>
    </div>
  );
}
