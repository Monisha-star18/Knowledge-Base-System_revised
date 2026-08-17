export class ArticleService {

    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }


    // GET - Articles with optional filters
    async getArticles(filters = {}) {

        const params = new URLSearchParams();

        Object.keys(filters).forEach(key => {

            if (filters[key] !== undefined && filters[key] !== null) {
                params.append(key, filters[key]);
            }

        });

        const query = params.toString();

        const res = await fetch(
            `${this.apiUrl}/articles${query ? `?${query}` : ""}`
        );

        if (!res.ok) {
            throw new Error("Failed to fetch articles");
        }

        return await res.json();
    }


    // GET - Single article
    async getArticleById(id) {

        const res = await fetch(
            `${this.apiUrl}/articles/${id}`
        );

        if (!res.ok) {
            throw new Error("Failed to fetch article");
        }

        return await res.json();
    }


    // PATCH - Update article
    async updateArticle(id, data) {

        const res = await fetch(
            `${this.apiUrl}/articles/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        if (!res.ok) {
            throw new Error("Failed to update article");
        }

        return await res.json();
    }


    // POST - Create article
    async createArticle(article) {

        const res = await fetch(
            `${this.apiUrl}/articles`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(article)
            }
        );

        if (!res.ok) {
            throw new Error("Failed to create article");
        }

        return await res.json();
    }


    // Soft Delete
    async softDeleteArticle(id) {

        return await this.updateArticle(
            id,
            {
                isDeleted: true
            }
        );
    }


    // Restore
    async restoreArticle(id) {

        return await this.updateArticle(
            id,
            {
                isDeleted: false
            }
        );
    }

}