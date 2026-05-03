import { baseApi } from './baseApi'

export interface NewsletterSubscriber {
  email: string
}

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<{ message: string }, NewsletterSubscriber>({
      query: (data) => ({
        url: '/newsletter/subscribe/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const { useSubscribeNewsletterMutation } = newsletterApi
