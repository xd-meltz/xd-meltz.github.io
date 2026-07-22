import { InstagramMetadata } from '../types';

/**
 * Fetches real-time Instagram post counts, follower levels, and active status
 * via our backend proxy route to guarantee bypassing CORS policy rules.
 */
export async function getInstagramMetadata(): Promise<InstagramMetadata> {
  try {
    const response = await fetch('/api/instagram');
    if (!response.ok) {
      throw new Error(`Failed to fetch instagram metrics: status ${response.status}`);
    }
    const data: InstagramMetadata = await response.json();
    return data;
  } catch (err) {
    console.warn('Could not contact live Instagram proxy node, using reliable fallback:', err);
    // Dynamic fallback matching same shape inside sandbox environment
    return {
      handle: '_rix.visuals_',
      isMocked: true,
      followers: '12.4k',
      following: '340',
      posts: 98,
      hasActiveStory: true,
      lastPostTime: '2 hours ago',
      fetchedAt: new Date().toISOString()
    };
  }
}
