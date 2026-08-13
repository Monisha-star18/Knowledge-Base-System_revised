// $(document).ready(async function () 
// {
//     // Setup profile offcanvas
//     const userData = localStorage.getItem("loggedUser");
//     if (!userData) { window.location.href = "../pages/index.html"; return; }
//     const loggedUser = JSON.parse(userData);
//     setupProfile(loggedUser);

//     // Get article ID from URL
//     const params = new URLSearchParams(window.location.search);
//     const articleId = params.get("id");

//     if (!articleId) 
//     {
//         $("#article-error").show();
//         return;
//     }

//     try 
//     {
//         const res = await fetch(`${API}/articles/${articleId}`);
//         if (!res.ok) throw new Error("Not found");
//         const art = await res.json();

//         // Populate fields
//         $(".article-count").html(`<i class="fa-solid fa-user"></i> <strong>${art.views}</strong> person to read this article!`);
//         $("#art-image").attr("src", art.image);
//         $("#art-category").text(art.category.charAt(0).toUpperCase() + art.category.slice(1));
//         $("#art-title").text(art.title);
//         $("#art-subtitle").text(art.subtitle);
//         $("#art-author").text(art.authorName || "Unknown");
//         $("#art-date").text(art.createdAt);
//         $("#art-intro").text(art.intro);

//         // Render content — preserve line breaks
//         $("#art-content").html(
//             art.content
//                 .split("\n")
//                 .map(line => line.trim() === "" ? "<br>" : `<p>${line}</p>`)
//                 .join("")
//         );

//         $("#article-content").show();

//         //for 1st and 100th user 
//         if (art.views === 100 || art.views === 1) 
//         {
//             confetti({
//                 particleCount: 500,   // number of pieces
//                 spread: 90,           // how wide it fans out
//                 origin: { y: 0.6 },  // where it fires from (0=top, 1=bottom)
//                 colors: ["#360ae8", "#c70874", "#ffffff"] // your brand colors
//             });
//         }
//     } 
    
//     catch (err) 
//     {
//         console.error(err);
//         $("#article-error").show();
//     }
    
// });

$(document).ready(function () {

    class ArticlePage {

        constructor() {
            this.loggedUser = null;
            this.articleId = null;
            this.article = null;
        }

        // Initialize the page
        async init() {

            // Get logged user
            const userData = localStorage.getItem("loggedUser");

            if (!userData) {
                window.location.href = "../pages/index.html";
                return;
            }

            this.loggedUser = JSON.parse(userData);

            // Setup profile
            setupProfile(this.loggedUser);

            // Get article ID
            const params = new URLSearchParams(window.location.search);
            this.articleId = params.get("id");

            if (!this.articleId) {
                this.showError();
                return;
            }

            // Load article
            await this.loadArticle();
        }


        // Fetch article from API
        async loadArticle() {

            try {

                const res = await fetch(
                    `${API}/articles/${this.articleId}`
                );

                if (!res.ok) {
                    throw new Error("Article not found");
                }

                this.article = await res.json();

                // Display article
                this.populateArticle();

                // Show article
                $("#article-content").show();

                // Check for 1st or 100th reader
                this.showCelebration();

            } catch (err) {

                console.error(err);
                this.showError();
            }
        }


        // Populate article data
        populateArticle() {

            const art = this.article;

            $(".article-count").html(
                `<i class="fa-solid fa-user"></i>
                 <strong>${art.views}</strong>
                 person to read this article!`
            );

            $("#art-image").attr("src", art.image);

            $("#art-category").text(
                art.category.charAt(0).toUpperCase() +
                art.category.slice(1)
            );

            $("#art-title").text(art.title);

            $("#art-subtitle").text(art.subtitle);

            $("#art-author").text(
                art.authorName || "Unknown"
            );

            $("#art-date").text(art.createdAt);

            $("#art-intro").text(art.intro);

            // Render article content
            $("#art-content").html(
                this.renderContent(art.content)
            );
        }


        // Convert article text into HTML
        renderContent(content) {

            return content
                .split("\n")
                .map(line =>
                    line.trim() === ""
                        ? "<br>"
                        : `<p>${line}</p>`
                )
                .join("");
        }


        // Show confetti for 1st and 100th reader
        showCelebration() {

            const views = this.article.views;

            if (views === 1 || views === 100) {

                confetti({
                    particleCount: 500,
                    spread: 90,
                    origin: {
                        y: 0.6
                    },
                    colors: [
                        "#360ae8",
                        "#c70874",
                        "#ffffff"
                    ]
                });
            }
        }


        // Show error message
        showError() {
            $("#article-error").show();
        }
    }


    // Create object
    const articlePage = new ArticlePage();

    // Start application
    articlePage.init();

});