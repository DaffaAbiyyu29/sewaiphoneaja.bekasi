import { motion } from "framer-motion";

export default function NavTabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="flex space-x-2 p-2 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`relative px-4 py-2 rounded-md text-sm font-medium focus:outline-none ${
                isActive ? "text-white" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className={`z-10 ${isActive ? "" : ""}`}>{t.label}</span>

              {isActive && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-0 rounded-md bg-blue-900 z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
