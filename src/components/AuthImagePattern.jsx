const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-dark-card p-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-lime/5 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-pink/5 blur-[100px] rounded-full animate-pulse"></div>
      
      <div className="max-w-md text-center relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl glass border border-white/5 ${
                i % 2 === 0 ? "animate-float" : "animate-pulse"
              }`}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <h2 className="text-4xl font-black mb-4 neon-text-lime tracking-tight uppercase italic">{title}</h2>
        <p className="text-zinc-400 text-lg leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
