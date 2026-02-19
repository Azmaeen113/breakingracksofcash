import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useUser } from '@/context/UserContext';
import { getUserLeague, getLeagueProgress } from '@/config/leagues';
import { LEAGUES } from '@/config/leagues';
import 'swiper/css';
import 'swiper/css/pagination';

export default function LeagueSlider() {
  const { user } = useUser();
  const swiperRef = useRef<any>(null);

  if (!user) return null;

  const currentLeague = getUserLeague(user.seasonCash);
  const progress = getLeagueProgress(user.seasonCash);
  const currentIndex = LEAGUES.findIndex(l => l.name === currentLeague.name);

  return (
    <div className="w-full">
      <Swiper
        modules={[Pagination]}
        spaceBetween={12}
        slidesPerView={1.2}
        centeredSlides
        initialSlide={currentIndex}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        className="league-swiper"
      >
        {LEAGUES.map((league, idx) => {
          const isCurrent = idx === currentIndex;
          const isLocked = idx > currentIndex;
          return (
            <SwiperSlide key={league.name}>
              <div className={`rounded-2xl p-5 border transition-all ${
                isCurrent
                  ? 'border-cyber-cyan glow-cyan bg-gradient-to-br from-cyber-cyan/10 to-cyber-purple/10'
                  : isLocked
                  ? 'border-gray-700/30 bg-cyber-dark/60 opacity-50'
                  : 'border-green-500/20 bg-green-500/5'
              }`}>
                <div className="text-center space-y-3">
                  {/* League icon */}
                  <img src={league.image} alt={league.name} className="w-16 h-16 mx-auto object-contain drop-shadow-lg" />
                  <div>
                    <h3 className="font-orbitron text-sm text-white">{league.name}</h3>
                    <p className="text-[10px] text-gray-500">
                      {league.minCash.toLocaleString()} - {league.maxCash === Infinity ? '∞' : league.maxCash.toLocaleString()} CASH
                    </p>
                  </div>

                  {/* Progress bar for current league */}
                  {isCurrent && (
                    <div className="space-y-1">
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {user.seasonCash.toLocaleString()} / {league.maxCash === Infinity ? '∞' : league.maxCash.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-orbitron ${
                    isCurrent ? 'bg-cyber-cyan/20 text-cyber-cyan' :
                    isLocked ? 'bg-gray-800 text-gray-500' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {isCurrent ? 'CURRENT' : isLocked ? 'LOCKED' : 'COMPLETED'}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom pagination styling */}
      <style>{`
        .league-swiper .swiper-pagination-bullet {
          background: rgba(0, 255, 255, 0.3);
          width: 6px;
          height: 6px;
        }
        .league-swiper .swiper-pagination-bullet-active {
          background: #00ffff;
          width: 20px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
