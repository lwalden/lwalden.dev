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
  desc: 'Senior Software Engineer specializing in .NET, Typescript, Event Driven Microservices. 12 years of building production software. I write about agentic AI, lessons learned, and the future of software engineering.',
  title: 'Laurance Walden — Senior Software Engineer | .NET, Azure & AI',
  navTitle: 'Laurance Walden — Software Engineer | Cloud, Enterprise & AI',
  ogImage: 'og.png',
  lang: 'en-US',
  base: '/',
  website: 'https://lwalden.dev',
  social: {
    github: 'https://github.com/lwalden',
    linkedin: 'https://www.linkedin.com/in/laurancewalden/',
    medium: 'https://medium.com/@lwalden',
  },
  homeHeroDescription:
    'I build enterprise systems, solo AI-integrated projects, and write about the rapidly evolving tools shaping the future of software development.',
  blogDescription:
    '.NET, Cloud Architecture , and AI integration. Builder content — working code, honest trade-offs.',
  projectsDescription:
    "Things I've built — open source tools, experiments, and integrations.",
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


