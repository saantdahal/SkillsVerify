import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardItem {
  rank: number;
  walletAddress: string;
  points: number;
}

const leaderboardData: LeaderboardItem[] = [
  { rank: 1, walletAddress: "0x0c...3d4", points: 3001 },
  { rank: 2, walletAddress: "0x0f...4d2", points: 2990 },
  { rank: 3, walletAddress: "0x0y...wd6", points: 2986 },
  { rank: 4, walletAddress: "0x0c...w2s", points: 2969 },
  { rank: 5, walletAddress: "0x0c...y2s", points: 2886 },
  { rank: 6, walletAddress: "0x0c...e5r", points: 2779 },
  { rank: 7, walletAddress: "0x0c...3o4", points: 2756 },
  { rank: 8, walletAddress: "0x0c...d2q", points: 2755 },
  { rank: 112, walletAddress: "0x0c...d54", points: 1551 },
];

const Leaderboard = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-3 text-sm font-medium text-gray-500 mb-2">
            <div>Rank</div>
            <div>Wallet address</div>
            <div className="text-right">Points</div>
          </div>

          {leaderboardData.map((item) => (
            <div
              key={item.rank}
              className={`grid grid-cols-3 text-sm py-2 px-1 rounded-md ${
                item.rank === 112
                  ? "bg-red-200 bg-opacity-40"
                  : "hover:bg-gray-100"
              }`}
            >
              <div>{item.rank}</div>
              <div className="font-mono">{item.walletAddress}</div>
              <div className="text-right">{item.points}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
