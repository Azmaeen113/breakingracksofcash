import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTasks, FaTrophy, FaUserFriends, FaShoppingBag } from 'react-icons/fa';

const tabs = [
  { key: '/tasks',       icon: FaTasks,        label: 'Tasks' },
  { key: '/ranks',        icon: FaTrophy,       label: 'Ranks' },
  { key: '/',            icon: null,           label: 'Home' },
  { key: '/friends',     icon: FaUserFriends,  label: 'Friends' },
  { key: '/shop',        icon: FaShoppingBag,  label: 'Shop' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-cyber-cyan/20 safe-bottom">
      <div className="flex items-end justify-around max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.key;
          const isCenter = tab.key === '/';

          if (isCenter) {
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.key)}
                className="relative -mt-6 flex flex-col items-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'border-cyber-cyan glow-cyan' : 'border-cyber-orange fire-border'
                  } bg-cyber-dark`}
                >
                  <span className="font-orbitron text-xl font-bold bg-gradient-to-br from-cyber-cyan to-cyber-pink bg-clip-text text-transparent">
                    BR
                  </span>
                </motion.div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-cyber-cyan' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          const Icon = tab.icon!;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.key)}
              className="flex flex-col items-center justify-center py-2 px-3"
            >
              <Icon className={`text-xl mb-1 transition-colors ${isActive ? 'text-cyber-cyan' : 'text-gray-500'}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-cyber-cyan' : 'text-gray-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div layoutId="navIndicator" className="absolute top-0 w-8 h-0.5 bg-cyber-cyan rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
