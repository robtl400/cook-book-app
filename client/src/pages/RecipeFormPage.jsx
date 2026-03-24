import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { DEFAULT_VALUES, mapPostToDefaults, mapCookToDefaults } from '../utils/recipe';
import { useRecipeSearch } from '../hooks/useRecipeSearch';
import StarRating from '../components/StarRating';
import IngredientsFields from '../components/IngredientsFields';
import StepsFields from '../components/StepsFields';
import TagSelector from '../components/TagSelector';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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
  const [sourceSearch, setSourceSearch, sourceResults, setSourceResults] = useRecipeSearch();
  const [sourceSelected, setSourceSelected] = useState(null);

  // Inspo search
  const [inspoSearch, setInspoSearch, inspoResults, setInspoResults] = useRecipeSearch();
  const [inspoSelected, setInspoSelected] = useState(null);

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
          const post = await api.get(`/posts/${id}`);
          const vals = mapPostToDefaults(post);
          reset(vals);
          if (post.image_url) setImagePreview(post.image_url);
          if (post.source_post) setSourceSelected(post.source_post);
          if (post.inspo_post) setInspoSelected(post.inspo_post);
        } else {
          // cook mode
          const src = await api.get(`/posts/recipe/cook/${id}`);
          setSourcePost(src);
          reset(mapCookToDefaults(src));
          const fallback = src.image_url || src.parsed_image_url || '';
          if (fallback) setParsedImageUrl(fallback);

          // Find the user's "Cooked" box
          if (user?.id) {
            try {
              const boxes = await api.get(`/users/${user.id}/boxes`);
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
  }, [mode, id, user?.id]);

  // ── Parse URL ────────────────────────────────────────────────────────────
  async function handleParseUrl() {
    const url = getValues('source_url');
    if (!url) return;
    setParseLoading(true);
    setParseError('');
    try {
      const parsed = await api.post('/parse/recipe', { url });
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
    if (!data.self_rating) {
      setSubmitError('Please rate this recipe before submitting.');
      return;
    }
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
        newPost = await api.patch(`/posts/${id}`, payload);
      } else {
        newPost = await api.post('/posts/recipe', payload);
        // Auto-save to Cooked box in cook mode
        if (mode === 'cook' && cookedBoxId) {
          try {
            await api.post(`/posts/${newPost.id}/save`, { box_id: cookedBoxId });
          } catch { /* best-effort */ }
        }
      }

      toast.success(mode === 'edit' ? 'Recipe updated!' : 'Recipe saved!');
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
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-400">{pageError}</p>
      </div>
    );
  }

  const modeLabel = mode === 'cook' ? 'I Cooked This' : mode === 'edit' ? 'Edit Recipe' : 'New Recipe';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-text mb-1">{modeLabel}</h1>
      {mode === 'cook' && sourcePost && (
        <p className="text-text-muted mb-6 text-sm">
          Based on <span className="font-semibold">{sourcePost.title}</span>
          {sourcePost.user?.display_name && (
            <> by {sourcePost.user.display_name}</>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">

        {/* ── Title ── */}
        <section>
          <label className="block text-sm font-semibold text-text mb-1">
            Title <span className="text-accent">*</span>
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full border border-border rounded px-3 py-2 text-text bg-surface-input focus:outline-none focus:ring-2 focus:ring-cta"
            placeholder="Give your recipe a name"
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
        </section>

        {/* ── Description ── */}
        <section>
          <label className="block text-sm font-semibold text-text mb-1">Description</label>
          <textarea
            {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
            rows={3}
            maxLength={500}
            className="w-full border border-border rounded px-3 py-2 text-text bg-surface-input focus:outline-none focus:ring-2 focus:ring-cta resize-none"
            placeholder="What makes this recipe special?"
          />
          <p className="text-xs text-text-dim text-right mt-0.5">
            {watchDescription?.length ?? 0}/500
          </p>
          {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
        </section>

        {/* ── Ingredients ── */}
        <IngredientsFields
          register={register}
          fields={ingFields}
          append={appendIng}
          remove={removeIng}
          swap={swapIng}
        />

        {/* ── Steps ── */}
        <StepsFields
          register={register}
          fields={stepFields}
          append={appendStep}
          remove={removeStep}
          swap={swapStep}
        />

        {/* ── Attribution ── */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">Recipe Source</label>

          {mode === 'cook' ? (
            <div className="bg-surface-input rounded p-3 text-sm text-text-muted">
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
                      className="accent-cta"
                    />
                    <span className="text-sm text-text">{opt.label}</span>
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
                      className="flex-1 border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
                    />
                    <button
                      type="button"
                      onClick={handleParseUrl}
                      disabled={parseLoading || !watchSourceUrl}
                      className="px-3 py-2 bg-cta text-white text-sm rounded-sm hover:bg-cta-dark disabled:opacity-50 whitespace-nowrap"
                    >
                      {parseLoading ? 'Parsing…' : 'Parse Recipe'}
                    </button>
                  </div>
                  {parseError && <p className="text-red-400 text-sm">{parseError}</p>}
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
                      setSourceSearch(e.target.value);
                    }}
                    placeholder="Search CookBook recipes…"
                    className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
                  />
                  {sourceResults.length > 0 && !sourceSelected && (
                    <ul className="absolute z-10 w-full bg-surface-raised border border-border rounded mt-1 shadow-lg max-h-44 overflow-y-auto">
                      {sourceResults.map(r => (
                        <li key={r.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-input"
                            onClick={() => {
                              setSourceSelected(r);
                              setValue('source_post_id', r.id);
                              setSourceResults([]);
                              setSourceSearch('');
                            }}
                          >
                            {r.title}
                            {r.user?.display_name && (
                              <span className="text-text-muted"> — {r.user.display_name}</span>
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
                  className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
                />
              )}
            </>
          )}

          {/* Inspo field */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-text-muted mb-1">
              Inspiration (optional)
            </label>
            {mode === 'cook' ? (
              <p className="text-sm text-text-muted italic">Inspiration from the original post.</p>
            ) : (
              <div className="relative">
                <input
                  value={inspoSelected ? inspoSelected.title : inspoSearch}
                  onChange={e => {
                    setInspoSelected(null);
                    setValue('inspo_post_id', null);
                    setInspoSearch(e.target.value);
                  }}
                  placeholder="Link to an inspiring recipe on CookBook…"
                  className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
                />
                {inspoResults.length > 0 && !inspoSelected && (
                  <ul className="absolute z-10 w-full bg-surface-raised border border-border rounded mt-1 shadow-lg max-h-44 overflow-y-auto">
                    {inspoResults.map(r => (
                      <li key={r.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-input"
                          onClick={() => {
                            setInspoSelected(r);
                            setValue('inspo_post_id', r.id);
                            setInspoResults([]);
                            setInspoSearch('');
                          }}
                        >
                          {r.title}
                          {r.user?.display_name && (
                            <span className="text-text-muted"> — {r.user.display_name}</span>
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
          <label className="block text-sm font-semibold text-text mb-2">Photo</label>

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Recipe photo preview"
                className="w-full h-52 object-cover rounded"
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
                    className="w-full h-52 object-cover rounded opacity-50"
                  />
                  <p className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-1 rounded">
                    Upload your own photo to replace this.
                  </p>
                </div>
              )}

              {CLOUD_NAME && UPLOAD_PRESET ? (
                <div
                  className="border-2 border-dashed border-border rounded p-8 text-center cursor-pointer hover:border-cta transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-text-muted">Uploading…</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-text-muted text-sm">Drop an image here or click to upload</p>
                      <p className="text-xs text-text-dim mt-1">JPG, PNG, WEBP</p>
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
                  className="w-full border border-border rounded px-3 py-2 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
                />
              )}
              {imageError && <p className="text-red-400 text-sm mt-1">{imageError}</p>}
            </>
          )}
        </section>

        {/* ── Self-rating ── */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">
            Your Rating <span className="text-accent">*</span>
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
            <p className="text-red-400 text-sm mt-1">{errors.self_rating.message}</p>
          )}
        </section>

        {/* ── Metadata ── */}
        <section>
          <label className="block text-sm font-semibold text-text mb-2">Details</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Cook Time (min)</label>
              <input
                {...register('cook_time_minutes', { min: { value: 0, message: 'Must be ≥ 0' } })}
                type="number"
                min="0"
                placeholder="45"
                className="w-full border border-border rounded px-2 py-1.5 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Servings</label>
              <input
                {...register('servings', { min: { value: 1, message: 'Must be ≥ 1' } })}
                type="number"
                min="1"
                placeholder="4"
                className="w-full border border-border rounded px-2 py-1.5 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Difficulty</label>
              <select
                {...register('difficulty')}
                className="w-full border border-border rounded px-2 py-1.5 text-sm text-text bg-surface-input focus:outline-none focus:ring-1 focus:ring-cta"
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
        <TagSelector selectedTags={watchTagNames} onToggle={toggleTag} />

        {/* ── Submit ── */}
        {submitError && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded px-3 py-2">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-3 bg-cta text-white font-semibold rounded-sm hover:bg-cta-dark disabled:opacity-50 transition-colors"
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
