import { leaderboardData } from "@/lib/data"

export default function LeaderboardPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-fade-in">
        {/* Dateline */}
        <div className="dateline">{currentDate} — Society Pages</div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl newspaper-headline mb-4">SOCIETY RANKINGS</h1>
          <p className="newspaper-subhead text-xl italic">Distinguished Members of Intellectual Society</p>
        </div>

        {/* Leaderboard Table */}
        <div className="newspaper-article mb-8">
          <div className="newspaper-card-content">
            <h2 className="newspaper-subhead text-lg mb-6 border-b-2 border-gray-400 pb-3 text-center">
              TOP CONTRIBUTORS TO PUBLIC DISCOURSE
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-2 border-gray-400">
                <thead>
                  <tr className="border-b-2 border-gray-400 bg-gray-100">
                    <th className="text-left py-4 px-4 newspaper-subhead border-r border-gray-400">Position</th>
                    <th className="text-left py-4 px-4 newspaper-subhead border-r border-gray-400">Member Address</th>
                    <th className="text-left py-4 px-4 newspaper-subhead border-r border-gray-400">
                      Debates Completed
                    </th>
                    <th className="text-left py-4 px-4 newspaper-subhead">Honors & Distinctions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user, index) => (
                    <tr
                      key={user.rank}
                      className={`border-b border-gray-400 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="py-4 px-4 border-r border-gray-400">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                          </span>
                          <div>
                            <span className="newspaper-subhead">#{user.rank}</span>
                            <div className="newspaper-caption text-xs">
                              {user.rank === 1
                                ? "Champion"
                                : user.rank === 2
                                  ? "Runner-up"
                                  : user.rank === 3
                                    ? "Third Place"
                                    : "Member"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 border-r border-gray-400">
                        <code className="newspaper-body text-sm font-mono">{user.address}</code>
                      </td>
                      <td className="py-4 px-4 border-r border-gray-400">
                        <span className="news-tag">{user.debates}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {user.badges.map((badge, index) => (
                            <span key={index} className="text-xl">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Special Leaders Unlock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="newspaper-article">
              <div className="newspaper-card-content">
                <h2 className="newspaper-subhead text-lg mb-6 border-b-2 border-gray-400 pb-3 text-center">
                  EXCLUSIVE ACCESS REQUIREMENTS
                </h2>

                <div className="space-y-6">
                  <div className="border-2 border-gray-400 p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <div>
                          <h3 className="newspaper-subhead">Plato</h3>
                          <p className="newspaper-body text-sm">Ancient Greek philosopher</p>
                          <p className="newspaper-caption text-xs">Requires 5 Records to unlock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-32 bg-gray-300 border border-gray-400 h-3 mb-2">
                          <div className="bg-gray-600 h-full border-r border-gray-400" style={{ width: "40%" }}></div>
                        </div>
                        <span className="newspaper-caption text-sm">2/5 Records</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-400 p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <div>
                          <h3 className="newspaper-subhead">Cleopatra</h3>
                          <p className="newspaper-body text-sm">Last pharaoh of Egypt</p>
                          <p className="newspaper-caption text-xs">Requires 10 Records to unlock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-32 bg-gray-300 border border-gray-400 h-3 mb-2">
                          <div className="bg-gray-600 h-full border-r border-gray-400" style={{ width: "20%" }}></div>
                        </div>
                        <span className="newspaper-caption text-sm">2/10 Records</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-400 p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                          <span className="text-2xl">🔒</span>
                        </div>
                        <div>
                          <h3 className="newspaper-subhead">Sun Tzu</h3>
                          <p className="newspaper-body text-sm">Ancient Chinese military strategist</p>
                          <p className="newspaper-caption text-xs">Requires 15 Records to unlock</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-32 bg-gray-300 border border-gray-400 h-3 mb-2">
                          <div className="bg-gray-600 h-full border-r border-gray-400" style={{ width: "13%" }}></div>
                        </div>
                        <span className="newspaper-caption text-sm">2/15 Records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Society Notice Sidebar */}
          <div className="lg:col-span-1">
            <div className="classified-sidebar mb-6">
              <h3 className="newspaper-subhead text-sm mb-3 text-center border-b border-gray-400 pb-2">
                SOCIETY NOTICES
              </h3>
              <div className="space-y-3 text-xs newspaper-body">
                <div className="border-b border-gray-400 pb-2">
                  <strong>MEMBERSHIP DRIVE:</strong> New members welcome to join intellectual society
                </div>
                <div className="border-b border-gray-400 pb-2">
                  <strong>WEEKLY DEBATES:</strong> Public discourse every Sunday at the Arena
                </div>
                <div className="border-b border-gray-400 pb-2">
                  <strong>SPECIAL RECOGNITION:</strong> Top contributors receive exclusive access
                </div>
                <div className="text-center pt-2 border-t border-gray-400">
                  <p className="newspaper-caption">"Excellence in Discourse"</p>
                </div>
              </div>
            </div>

            <div className="newspaper-article">
              <div className="newspaper-card-content">
                <h3 className="newspaper-subhead text-sm mb-3 text-center border-b border-gray-400 pb-2">
                  ACHIEVEMENT GUIDE
                </h3>
                <div className="space-y-3 text-xs newspaper-body">
                  <div>
                    <strong>🥇 Gold Medal:</strong> 15+ debates completed
                  </div>
                  <div>
                    <strong>🥈 Silver Medal:</strong> 10+ debates completed
                  </div>
                  <div>
                    <strong>🥉 Bronze Medal:</strong> 5+ debates completed
                  </div>
                  <div className="border-t border-gray-400 pt-2 mt-3">
                    <p className="newspaper-caption text-center">Earn your place in history</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
