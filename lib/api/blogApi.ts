import { baseApi } from './baseApi'

export interface BlogImage {
  id: string
  image: string
  caption: string | null
  is_cover: boolean
  order: number
  uploaded_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  author_name: string | null
  category: string
  category_display: string
  excerpt: string
  tags: string[]
  status: string
  published_at: string
  cover_image: BlogImage | null
}

export interface BlogsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Blog[]
}

export interface BlogCategoryCount {
  value: string
  label: string
  count: number
}

export interface BlogTagCount {
  tag: string
  count: number
}

export interface BlogSidebarData {
  categories: BlogCategoryCount[]
  popular_tags: BlogTagCount[]
  recent_posts: Blog[]
}

export interface BlogDetail extends Omit<Blog, 'cover_image'> {
  body: string
  images: BlogImage[]
  created_at: string
  updated_at: string
}

export interface BlogsQueryParams {
  page?: number
  page_size?: number
  search?: string
  category?: string
  tag?: string
  status?: string
  ordering?: string
}

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<BlogsListResponse, BlogsQueryParams | void>({
      query: (params) => ({
        url: '/blog/',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Blog' as const, id })),
              { type: 'Blog', id: 'LIST' },
            ]
          : [{ type: 'Blog', id: 'LIST' }],
    }),
    getBlogDetail: builder.query<BlogDetail, string>({
      query: (slug) => `/blog/${slug}/`,
      providesTags: (_result, _error, slug) => [{ type: 'Blog', id: slug }],
    }),

    getBlogSidebar: builder.query<BlogSidebarData, void>({
      query: () => ({ url: '/blog/sidebar/' }),
      providesTags: [{ type: 'Blog', id: 'SIDEBAR' }],
    }),
  }),
})

export const { useGetBlogsQuery, useGetBlogDetailQuery, useGetBlogSidebarQuery } = blogApi
