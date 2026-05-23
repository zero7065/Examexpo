// src/components/ProgressBar.jsx
const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="h-1 bg-white/5 w-full overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
