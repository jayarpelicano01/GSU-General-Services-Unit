interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'white' | 'slate';
}

const Spinner = ({ size = 'md', color = 'indigo' }: SpinnerProps) => {
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4', 
  lg: 'w-12 h-12 border-4',
};

  const colors = {
    indigo: 'border-indigo-100 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500',
    white:  'border-white/20 border-t-white',
    slate:  'border-slate-100 border-t-slate-500 dark:border-slate-700 dark:border-t-slate-400',
  };

  return (
    <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`} />
  );
};

export default Spinner; 