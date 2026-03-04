export interface SiteConfig {
  author: string;
  desc: string;
  title: string;
  navTitle: string;
  ogImage: string;
  lang: string;
  base: string;
  website: string;
  social: Record<string, string>;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  homeHeroDescription: string;
  blogDescription: string;
  projectsDescription: string;
  featuredPostsCount: number;
  latestPostsCount: number;
  homeProjects: {
    enabled: boolean;
    count: number;
  };
  cta: {
    enabled: boolean;
    filePath: string;
  };
  hero: {
    enabled: boolean;
    filePath: string;
  };
  comments: {
    enabled: boolean;
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
    reactionsEnabled: boolean;
    emitMetadata: boolean;
    inputPosition: 'top' | 'bottom';
    theme: string;
    lang: string;
  };
}

export const SITE: SiteConfig = {
  author: 'Laurance Walden',
  desc: 'Senior software engineer designing resilient cloud systems and practical AI workflows. I write about architecture trade-offs, delivery patterns, and what holds up in production.',
  title: 'Laurance Walden — Senior Software Engineer | .NET, Azure & AI',
  navTitle: 'Laurance Walden',
  ogImage: 'og.png',
  lang: 'en-US',
  base: '/',
  website: 'https://lwalden.dev',
  social: {
    github: 'https://github.com/lwalden',
    linkedin: 'https://www.linkedin.com/in/laurancewalden/',
    medium: 'https://medium.com/@lwalden',
  },
  twitterHandle: '@lwalden',
  homeHeroDescription:
    'I design resilient cloud platforms and practical AI integrations, then document the decisions, trade-offs, and implementation details behind them.',
  blogDescription:
    'Architecture notes on .NET, cloud systems, and AI integration. Working code, measured trade-offs, and production lessons.',
  projectsDescription:
    "Selected builds: production integrations, open-source tools, and focused experiments.",
  featuredPostsCount: 3,
  latestPostsCount: 3,
  homeProjects: {
    enabled: true,
    count: 2,
  },
  cta: {
    enabled: false,
    filePath: 'site/cta.md',
  },
  hero: {
    enabled: true,
    filePath: 'site/hero.md',
  },
  comments: {
    enabled: false,
    repo: 'lwalden/lwalden.dev',
    repoId: '',
    category: 'General',
    categoryId: '',
    mapping: 'pathname',
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme',
    lang: 'en',
  },
};


