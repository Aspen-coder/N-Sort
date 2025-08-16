import { motion } from "framer-motion";

export interface CardProps {
  title: string;
  icon: string;
  gradient: string; // e.g., "from-purple-500 to-pink-500"
  color: string;    // e.g., "purple"
  onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ title, icon, gradient, color, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`relative group rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300`}
    >
      {/* Top Half - Icon & Gradient */}
      <div className={`bg-gradient-to-br ${gradient} h-28 flex items-center justify-center relative`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md">
          <span className="text-4xl">{icon}</span>
        </div>
      </div>

      {/* Title */}
      <div className="p-5 text-center relative z-10 bg-white">
        <h3 className={`text-${color}-700 font-bold text-lg group-hover:text-${color}-800 transition-colors`}>
          {title}
        </h3>
      </div>

      {/* Enhanced Hover Glow */}
      <div
        className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-300`}
        style={{
          background: `linear-gradient(135deg, ${gradient.replace('from-', '#').replace('to-', '#')})`,
          filter: "blur(20px)",
          zIndex: 0,
        }}
      ></div>
    </motion.button>
  );
};
