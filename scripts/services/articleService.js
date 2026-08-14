class ArticleService {

    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }


    // GET - All articles
    async getArticles(category) 
    {

        const res = await fetch( `${this.apiUrl}/articles?category=${category}&isDeleted=false`);

        if (!res.ok) { throw new Error("Failed to fetch articles");}

        return await res.json();
    }


    // PATCH - Update article
    async updateArticle(id, data) 
    {

        const res = await fetch( `${this.apiUrl}/articles/${id}`,
            {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            }
        );

        if (!res.ok) {throw new Error("Failed to update article");}

        return await res.json();
    }

}