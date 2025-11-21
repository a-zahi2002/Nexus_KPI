import { useState } from 'react';
import { contributionService } from '../services/contribution-service';
import { Loader2 } from 'lucide-react';
import type { Member } from '../types/database';

interface AddContributionFormProps {
  member: Member;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddContributionForm({ member, onSuccess, onCancel }: AddContributionFormProps) {
  const [formData, setFormData] = useState({
    project_name: '',
    time_period: '',
    position: '',
    points: '',
    avenue: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avenues = [
    'Leadership Development',
    'Environmental Sustainability',
    'Hunger Relief',
    'Vision Care',
    'Childhood Cancer',
    'Diabetes Awareness',
    'Youth Camps',
    'Community Service',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await contributionService.create({
        member_reg_no: member.reg_no,
        project_name: formData.project_name,
        time_period: formData.time_period,
        position: formData.position,
        points: parseInt(formData.points, 10),
        avenue: formData.avenue || null,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-maroon-50 dark:bg-maroon-900/20 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Member</p>
        <p className="font-semibold text-gray-900 dark:text-white">
          {member.name_with_initials}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{member.reg_no}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.project_name}
          onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
          required
          placeholder="World Diabetes Day Campaign"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Time Period <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.time_period}
          onChange={(e) => setFormData({ ...formData, time_period: e.target.value })}
          required
          placeholder="November 2024"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Position / Role <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          required
          placeholder="Project Coordinator"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Points <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: e.target.value })}
          required
          min="0"
          placeholder="10"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Avenue / Category
        </label>
        <select
          value={formData.avenue}
          onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select Avenue (Optional)</option>
          {avenues.map((avenue) => (
            <option key={avenue} value={avenue}>
              {avenue}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-maroon-600 hover:bg-maroon-700 disabled:bg-maroon-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Contribution'
          )}
        </button>
      </div>
    </form>
  );
}
