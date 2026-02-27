export default function Spinner({ size = 'md' }) {
  const sz =
    size === 'sm'
      ? 'w-5 h-5 border-2'
      : size === 'lg'
      ? 'w-12 h-12 border-4'
      : 'w-8 h-8 border-4';
  return (
    <div className="flex justify-center py-10">
      <div className={`${sz} border-burnt-orange border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
