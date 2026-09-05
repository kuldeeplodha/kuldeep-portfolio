export interface BlogMetadata {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTimeMinutes?: number;
  roles?: string[];
}

export interface BlogPost extends BlogMetadata {
  body: string;
}
