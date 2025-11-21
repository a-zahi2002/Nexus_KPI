import { useState, useEffect } from 'react';
import { memberService } from '../services/member-service';
import { contributionService } from '../services/contribution-service';
import { Search, UserPlus, Award, User, X, FileDown } from 'lucide-react';
import type { Member, Contribution } from '../types/database';
import { NewMemberForm } from '../components/NewMemberForm';
import { AddContributionForm } from '../components/AddContributionForm';
import { BulkImportModal } from '../components/BulkImportModal';
import { usePermissions } from '../hooks/usePermissions';

interface MembersProps {
  initialSearch?: string;
  initialAction?: string;
}

export function Members({ initialSearch, initialAction }: MembersProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [searchResult, setSearchResult] = useState<Member | null>(null);
  const [memberNotFound, setMemberNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const { canEdit } = usePermissions();

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (initialSearch) {
      handleSearch(initialSearch);
    }
    if (initialAction === 'add-points') {
      setShowAddContribution(true);
    }
  }, [initialSearch, initialAction]);

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const data = await memberService.getAll();
      setAllMembers(data);
    } catch (error) {
      console.error('Failed to load members', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setLoading(true);
    setMemberNotFound(false);
    setSearchResult(null);
    setContributions([]);

    try {
      const member = await memberService.getByRegNo(searchTerm.trim());

      if (member) {
        setSearchResult(member);
        const memberContributions = await contributionService.getByMember(member.reg_no);
        setContributions(memberContributions);
      } else {
        setMemberNotFound(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMemberNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberCreated = (member: Member) => {
    setShowNewMemberForm(false);
    setSearchResult(member);
    setMemberNotFound(false);
    setSearchQuery(member.reg_no);
    loadMembers(); // Reload list to include new member
  };

  const handleContributionAdded = async () => {
    setShowAddContribution(false);
    if (searchResult) {
      const updatedMember = await memberService.getByRegNo(searchResult.reg_no);
      if (updatedMember) {
        setSearchResult(updatedMember);
      }
      const memberContributions = await contributionService.getByMember(searchResult.reg_no);
      setContributions(memberContributions);
      loadMembers(); // Reload list to update points
    }
  };

  const handleBulkImportSuccess = () => {
    loadMembers(); // Reload list after bulk import
    if (searchResult) {
      handleSearch(searchResult.reg_no);
    }
  };

  const handleViewMember = (member: Member) => {
    setSearchResult(member);
    setSearchQuery(member.reg_no);
    setMemberNotFound(false);
    // Fetch contributions for the selected member
    contributionService.getByMember(member.reg_no).then(setContributions);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Member Lookup
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Search for members by Registration Number or view the leaderboard
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <FileDown className="w-5 h-5" />
              Bulk Import
            </button>
          )}
        </div>
        {!canEdit && (
          <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Viewer Mode:</strong> You have read-only access. Contact an admin or editor to register members or add contributions.
            </p>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter University Reg No (e.g., S/2021/001)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white/50 dark:bg-dark-bg/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 bg-maroon-600 hover:bg-maroon-700 disabled:bg-maroon-400 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-maroon-600/20"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
        </div>
      )}

      {memberNotFound && !loading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <User className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Member Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No member found with Registration Number "{searchQuery}". {canEdit ? 'Would you like to register this member?' : 'Please contact an admin or editor to register this member.'}
              </p>
              {canEdit && (
                <button
                  onClick={() => setShowNewMemberForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  Register New Member
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {searchResult && !loading ? (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-maroon-600 to-maroon-700 p-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSearchResult(null)}
                className="mr-2 p-1 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Back to list"
              >
                <X className="w-5 h-5" />
              </button>
              {searchResult.photo_url ? (
                <img
                  src={searchResult.photo_url}
                  alt={searchResult.full_name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <span className="text-3xl font-bold text-maroon-600">
                    {searchResult.name_with_initials.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {searchResult.name_with_initials}
                </h2>
                <p className="text-maroon-100 mt-1">
                  {searchResult.full_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">
                  {searchResult.total_points}
                </p>
                <p className="text-maroon-100 text-sm">Service Points</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registration No</p>
                <p className="font-semibold text-gray-900 dark:text-white">{searchResult.reg_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Batch</p>
                <p className="font-semibold text-gray-900 dark:text-white">{searchResult.batch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Faculty</p>
                <p className="font-semibold text-gray-900 dark:text-white">{searchResult.faculty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                <p className="font-semibold text-gray-900 dark:text-white">{searchResult.whatsapp}</p>
              </div>
              {searchResult.my_lci_num && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">MyLCI Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{searchResult.my_lci_num}</p>
                </div>
              )}
            </div>

            {canEdit && (
              <button
                onClick={() => setShowAddContribution(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Award className="w-5 h-5" />
                Add Contribution
              </button>
            )}

            {contributions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contribution History ({contributions.length})
                </h3>
                <div className="space-y-3">
                  {contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {contribution.project_name}
                        </h4>
                        <span className="text-lg font-bold text-maroon-600 dark:text-maroon-400">
                          {contribution.points} pts
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Position: {contribution.position}</p>
                        <p>Period: {contribution.time_period}</p>
                        {contribution.avenue && <p>Avenue: {contribution.avenue}</p>}
                        <p>Added: {new Date(contribution.date_added).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        !loading && !memberNotFound && (
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Members List
              </h2>
            </div>
            
            {loadingMembers ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-600"></div>
              </div>
            ) : allMembers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Rank</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Member</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Reg No</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Faculty</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Points</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {allMembers.map((member, index) => (
                      <tr 
                        key={member.reg_no}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' : 
                              index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300' : 
                              index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 
                              'text-gray-500 dark:text-gray-400'}
                          `}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.name_with_initials}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-maroon-500/20 flex items-center justify-center text-maroon-600 dark:text-maroon-400 font-bold">
                                {member.name_with_initials.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {member.name_with_initials}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {member.batch}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {member.reg_no}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {member.faculty}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-maroon-600 dark:text-neon-blue">
                            {member.total_points}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewMember(member)}
                            className="text-sm text-maroon-600 hover:text-maroon-700 dark:text-maroon-400 dark:hover:text-maroon-300 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {showNewMemberForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur border-b border-gray-200 dark:border-dark-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Register New Member
              </h2>
              <button
                onClick={() => setShowNewMemberForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <NewMemberForm
                initialRegNo={searchQuery}
                onSuccess={handleMemberCreated}
                onCancel={() => setShowNewMemberForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showAddContribution && searchResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur border-b border-gray-200 dark:border-dark-border p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Contribution
              </h2>
              <button
                onClick={() => setShowAddContribution(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AddContributionForm
                member={searchResult}
                onSuccess={handleContributionAdded}
                onCancel={() => setShowAddContribution(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={handleBulkImportSuccess}
        />
      )}
    </div>
  );
}
