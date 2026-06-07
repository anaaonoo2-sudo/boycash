/* Developed & Owned by Bouchibat - anaaonoo2@gmail.com - 2026 */
import { useTranslation } from "react-i18next";
import GlassCard from "@/src/components/ui/GlassCard";
import { Trophy } from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function Leaderboard() {
  const { t } = useTranslation();

  const leaders = [
    { rank: 1, name: "Yacine", coins: "18,420", avatar: "Y", bonus: `+500 ${t("coins_unit")}` },
    { rank: 2, name: "Sara", coins: "15,290", avatar: "S" },
    { rank: 3, name: "Mehdi", coins: "12,080", avatar: "M" },
    { rank: 4, name: "Lina", coins: "9,870", avatar: "L" },
    { rank: 5, name: "Karim", coins: "8,540", avatar: "K" },
    { rank: 6, name: "Fatima", coins: "7,320", avatar: "F" },
    { rank: 7, name: "Amine", coins: "6,210", avatar: "A" },
  ];

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="space-y-6">
      <header className="text-center space-y-1 mb-8">
        <h1 className="text-3xl font-black tracking-tight">{t("leaderboard")}</h1>
        <p className="text-gray-400 text-xs">{t("highest_earnings_this_week")}</p>
      </header>

      {/* Top 3 Podium */}
      <GlassCard className="p-4 pt-10 flex justify-around items-end gap-2 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />
        
        {/* Silver */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white/20 flex items-center justify-center text-xl font-bold">
            {top3[1].avatar}
          </div>
          <p className="text-xs font-bold">{top3[1].name}</p>
          <p className="text-[10px] text-gray-500 font-black">{top3[1].coins}</p>
          <div className="bg-white/10 px-3 py-0.5 rounded-full text-[10px] text-gray-400 font-bold">#2</div>
        </div>

        {/* Gold */}
        <div className="flex flex-col items-center gap-2 -translate-y-4">
          <div className="relative">
            <Trophy className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 fill-yellow-500/20" size={24} />
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-500/20">
              {top3[0].avatar}
            </div>
          </div>
          <p className="text-sm font-black">{top3[0].name}</p>
          <p className="text-xs text-yellow-500 font-black tracking-tight">{top3[0].coins}</p>
          <div className="bg-yellow-500 border border-yellow-600 px-4 py-0.5 rounded-full text-[10px] text-yellow-950 font-black shadow-lg">#1</div>
        </div>

        {/* Bronze */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white/20 flex items-center justify-center text-xl font-bold">
            {top3[2].avatar}
          </div>
          <p className="text-xs font-bold">{top3[2].name}</p>
          <p className="text-[10px] text-gray-500 font-black">{top3[2].coins}</p>
          <div className="bg-white/10 px-3 py-0.5 rounded-full text-[10px] text-gray-400 font-bold">#3</div>
        </div>
      </GlassCard>

      {/* List */}
      <GlassCard className="p-0 overflow-hidden">
        {leaders.map((leader, i) => (
          <div 
            key={i} 
            className="p-5 flex items-center gap-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
          >
            <span className="text-xs text-gray-500 font-bold w-4">#{leader.rank}</span>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-white/10",
              i === 0 ? "bg-accent-green" : i === 1 ? "bg-pink-500" : i === 2 ? "bg-orange-500" : "bg-blue-500"
            )}>
              {leader.avatar}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">{leader.name}</h4>
              {leader.bonus && <p className="text-[10px] text-accent-green font-bold truncate">{t("weekly_reward")} • {leader.bonus}</p>}
            </div>
            <span className="text-sm font-black text-yellow-500 tracking-tight">{leader.coins}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
