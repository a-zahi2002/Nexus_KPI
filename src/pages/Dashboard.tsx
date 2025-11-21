import { useState, useEffect } from 'react';
import { memberService } from '../services/member-service';
import { contributionService } from '../services/contribution-service';
import { Trophy, Award, TrendingUp, Search, Plus } from 'lucide-react';
import type { Member } from '../types/database';

interface DashboardProps {
  onNavigate?: (page: string, data?: unknown) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [topMembers, setTopMembers] = useState<Member[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [monthlyProjects, setMonthlyProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [members, points, projects] = await Promise.all([
        memberService.getTopMembers(3),
        contributionService.getTotalPoints(),
        contributionService.getMonthlyStats(new Date().getFullYear(), new Date().getMonth() + 1)
      ]);

      setTopMembers(members);
      setTotalPoints(points);
      setMonthlyProjects(projects);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() && onNavigate) {
      onNavigate('members', { search: searchQuery });
    }
  };

  const handleQuickAddPoints = () => {
    if (onNavigate) {
      onNavigate('members', { action: 'add-points' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your overview
          </p>
        </div>

        <button
          onClick={handleQuickAddPoints}
          className="flex items-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Contribution
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Service Points
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalPoints.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-maroon-100 dark:bg-maroon-900/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-maroon-600 dark:text-maroon-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Projects This Month
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {monthlyProjects}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Members
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {topMembers.length > 0 ? '3+' : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gold-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gold-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Member Lookup
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter University Reg No (e.g., S/2021/001)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-gold-600 dark:text-yellow-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Top Contributors
          </h2>
        </div>

        {topMembers.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No members found. Add members to see leaderboard.
          </p>
        ) : (
          <div className="space-y-4">
            {topMembers.map((member, index) => (
              <div
                key={member.reg_no}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-gold-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {index + 1}
                </div>

                <div className="flex-shrink-0">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-maroon-100 dark:bg-maroon-900/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-maroon-600 dark:text-maroon-400">
                        {member.name_with_initials.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {member.name_with_initials}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.reg_no} • {member.faculty}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-maroon-600 dark:text-maroon-400">
                    {member.total_points}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
