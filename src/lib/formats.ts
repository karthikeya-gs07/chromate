export type Format = 'story' | 'post'

export const FORMATS: Record<Format, { label: string; plural: string; width: number; height: number }> = {
  story: { label: 'Story', plural: 'Stories', width: 1080, height: 1920 },
  post: { label: 'Post', plural: 'Posts', width: 1080, height: 1350 },
}

export const MAX_PHOTOS = 10

export type Photo = {
  id: string
  file: File
  url: string
}
