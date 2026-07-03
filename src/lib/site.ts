// Central site configuration — replaces Jekyll's _config.yml.

export const SITE = {
  title: 'yaodong.dev',
  description: 'Personal blog of Yaodong Zhao',
  url: 'https://yaodong.dev',
  lang: 'en-US',
  author: {
    name: 'Yaodong Zhao',
    url: 'https://yaodong.dev/about/',
    twitter: 'YaodongDev',
  },
  social: [
    'https://www.linkedin.com/in/yaodong/',
    'https://github.com/yaodong',
    'https://x.com/YaodongDev',
  ],
  navigation: [
    { title: 'Home', url: '/' },
    { title: 'Archive', url: '/archive/' },
    { title: 'Projects', url: '/projects/' },
    { title: 'Library', url: '/library/' },
    { title: 'About', url: '/about/' },
  ],
  googleAnalyticsId: 'G-E8XC309H1N',
} as const;

/** Strip the leading YYYY-MM-DD- from a post id to get its permalink slug. */
export function postSlug(id: string): string {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** Extract the YYYY-MM-DD filename-date prefix from a post id. */
export function postDatePrefix(id: string): string {
  const match = id.match(/^(\d{4}-\d{2}-\d{2})-/);
  return match ? match[1] : '';
}
