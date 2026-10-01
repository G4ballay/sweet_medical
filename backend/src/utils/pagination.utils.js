export class PaginationUtils {
    static paginate(items, start = 0, limit = 20) {
        const total = items.length;
        const paginatedItems = items.slice(start, start + limit);
        const page = Math.floor(start / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        return { total, page, totalPages, items: paginatedItems };
    }
}