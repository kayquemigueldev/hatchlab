export interface PageResponse<Content> {
    content: Content[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
}