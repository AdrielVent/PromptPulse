import type { DashboardStats, PostType, PromptedPost } from "../types";

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

export function getEngagementScore(post: PromptedPost): number {
  return Math.round(
    post.likes * 2.2 +
      post.comments * 4 +
      post.founderRelevance * 0.22 +
      post.usefulness * 0.18 +
      post.visualAppeal * 0.1
  );
}

function countBy<T extends string>(items: T[]): Map<T, number> {
  return items.reduce((map, item) => {
    map.set(item, (map.get(item) ?? 0) + 1);
    return map;
  }, new Map<T, number>());
}

export function getDashboardStats(posts: PromptedPost[]): DashboardStats {
  const totalPosts = posts.length;
  const averageLikes = roundToTwo(posts.reduce((sum, post) => sum + post.likes, 0) / totalPosts);
  const averageComments = roundToTwo(posts.reduce((sum, post) => sum + post.comments, 0) / totalPosts);
  const scoredPosts = posts
    .map((post) => ({ ...post, engagementScore: getEngagementScore(post) }))
    .sort((a, b) => b.engagementScore - a.engagementScore);

  const categories = Array.from(countBy(posts.map((post) => post.category)).entries())
    .map(([name, count]) => {
      const categoryPosts = scoredPosts.filter((post) => post.category === name);
      const averageEngagement = Math.round(
        categoryPosts.reduce((sum, post) => sum + post.engagementScore, 0) / categoryPosts.length
      );
      return { name, count, averageEngagement };
    })
    .sort((a, b) => b.count - a.count || b.averageEngagement - a.averageEngagement);

  const patterns = Array.from(countBy(posts.flatMap((post) => post.patterns)).entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const postTypePerformance = Array.from(countBy(posts.map((post) => post.postType)).entries())
    .map(([label, count]) => {
      const typePosts = scoredPosts.filter((post) => post.postType === label);
      const averageScore = Math.round(
        typePosts.reduce((sum, post) => sum + post.engagementScore, 0) / typePosts.length
      );
      return { label: label as PostType, averageScore, count };
    })
    .sort((a, b) => b.averageScore - a.averageScore);

  return {
    totalPosts,
    averageLikes,
    averageComments,
    topCategories: categories,
    topPatterns: patterns.slice(0, 6),
    topPosts: scoredPosts.slice(0, 5),
    postTypePerformance
  };
}
