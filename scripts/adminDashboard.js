
import {  API,  setupProfile, handleLogout } from './shared.js';

import { ArticleService } from './services/articleService.js';

let loggedUser = null;
let localArticles = []; 
let currentFilter = "all";
const articleService = new ArticleService(API);


$(document).ready(async function () 
{

    // take the login user data 
    const userData = localStorage.getItem("loggedUser");
    loggedUser = JSON.parse(userData);
    console.log(loggedUser)

    setupProfile(loggedUser); 
    

    // Initial fetch and render
    await fetchAndRenderArticles();

    //  Filters
    $("#filters .btn").on("click", function () 
    {
        $("#filters .btn").removeClass("active");
        $(this).addClass("active");

        const id = $(this).attr("id");
        if (id === "all-btn") currentFilter = "all";
        if (id === "approved-btn") currentFilter = "approved";
        if (id === "pending-btn") currentFilter = "pending";
        if (id === "rejected-btn") currentFilter = "rejected";

        renderCards();
    });

    //  Search
    $("#searchInput").on("input", function () {
        renderCards();
    });
});



// Fetch articles written in specific category
async function fetchAndRenderArticles() 
{

    try 
    {
        localArticles = await articleService.getArticles({
            category: loggedUser.category,
            isDeleted: false
        });
        renderCards();
    }

    catch (err) 
    {
        console.error(err);
        Swal.fire({icon: "error",title: "Error loading dashboard feed."});
    }
}
// Dynamically generate layout cards based on filter and search rules
function renderCards() {
    const container = $("#cards-container");
    container.empty();

    const searchVal = $("#searchInput").val().toLowerCase().trim();

    // Filter 
    let filtered = localArticles.filter(art => {
        const matchesFilter = (currentFilter === "all" || art.status === currentFilter);
        const matchesSearch = art.title.toLowerCase().includes(searchVal) || 
                              art.subtitle.toLowerCase().includes(searchVal) || 
                              art.category.toLowerCase().includes(searchVal);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        container.append(`<div class="text-center text-muted my-5 w-100">No articles found matching the criteria.</div>`);
        return;
    }

    // Loop & append items
    filtered.forEach(art => {
        let statusBadge = "";
        let footerRow = "";
        let actionButtons = "";

        if (art.status === "approved") {
            statusBadge = `<span class="badge-approved">✓ Approved</span>`;
            footerRow = `<div class="card-date-row approved"><i class="fa-solid fa-circle-check"></i> Approved on: ${art.reviewDate}</div>`;
        } else if (art.status === "rejected") {
            statusBadge = `<span class="badge-rejected">✕ Rejected</span>`;
            footerRow = `<div class="card-date-row rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected on: ${art.reviewDate}</div>`;
        } else {
            statusBadge = `<span class="badge-pending">⏳ Pending</span>`;
            footerRow = `<div class="card-date-row"><i class="fa-regular fa-clock"></i> Awaiting review</div>`;
            actionButtons = `
                <div class="card-actions">
                    <button class="btn-card-accept" data-id="${art.id}">
                        <i class="fa-solid fa-pen"></i> Accept
                    </button>
                    <button class="btn-card-reject" data-id="${art.id}">
                        <i class="fa-solid fa-trash"></i> Reject 
                    </button>
                </div>`;
        }

        const cardHtml = `
            <div class="article-card">
                <div class="card-img-wrap">
                    <img src="${art.image}" alt="Article cover" class="card-img">
                    <div class="card-status-pill">
                        ${statusBadge}
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-title">${art.title}</div>
                    <div class="card-sub">${art.subtitle}</div>
                    <div class="divider"></div>
                    <div class="card-meta-row d-flex flex-column">
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Submitted: ${art.createdAt}
                        </span>
                        <!-- ternary operator used to check if updatedAt exists else don't display -->
                        ${art.updatedAt ? `
                        <span class="card-meta-item">
                            <i class="fa-solid fa-calendar-days"></i> Updated: ${art.updatedAt}
                        </span>` : ''}
                        
                        <span class="card-meta-item">
                            <i class="fa-solid fa-tag"></i> ${art.category.charAt(0).toUpperCase() + art.category.slice(1)}
                        </span>
                       
                    </div>
                    ${footerRow}
                    ${art.remark ? `<span class="card-meta-item"> Remark : ${art.remark} </span>` : ''}
                    ${actionButtons}
                </div>
            </div>`;
        container.prepend(cardHtml);
    });
}



// ── Review Modal 
const remarkRegex = /^[a-zA-Z\s]{4,100}$/;
function openReviewModal(isAccept) {
    return new Promise((resolve) => {
        const modal      = new bootstrap.Modal(document.getElementById("reviewModal"));
        const title      = $("#reviewTitle");
        const confirmBtn = $("#confirmReview");
        const remark     = $("#reviewRemark");
        const error      = $("#remarkError");

        title.text(isAccept ? "Accept Article" : "Reject Article");

        confirmBtn
            .removeClass("btn-success btn-danger")
            .addClass(isAccept ? "btn-success" : "btn-danger");

        remark.val("").removeClass("is-invalid");
        error.addClass("d-none");

        modal.show();

        // clear error as soon as the field becomes valid
        remark.on("input.review", function () {
            const val = $(this).val().trim();
            if (val && remarkRegex.test(val)) {
                error.addClass("d-none");
                $(this).removeClass("is-invalid");
            }
        });

        confirmBtn.on("click.review", function () {
            const val = remark.val().trim();

            if (!val) {
                error.removeClass("d-none").text("Remark is required.");
                remark.addClass("is-invalid").trigger("focus");
                return;
            }

            if (!remarkRegex.test(val)) {
                error.removeClass("d-none").text("Remark can only contain letters and spaces — no numbers or symbols. Minimum -4 char");
                remark.addClass("is-invalid").trigger("focus");
                return;
            }

            cleanup();
            modal.hide();
            resolve(val);
        });

        $("#reviewModal").one("hidden.bs.modal", function () {
            cleanup();
            resolve(null);
        });

        function cleanup() {
            confirmBtn.off("click.review");
            remark.off("input.review");
        }
    });
}

// Event delegation for Accept / Reject buttons (works with dynamically rendered cards)
$(document).on("click", ".btn-card-accept, .btn-card-reject", async function () 
{
    const articleId  = $(this).data("id");
    const isAccept   = $(this).hasClass("btn-card-accept");
    const action     = isAccept ? "approved" : "rejected";

    const remark = await openReviewModal(isAccept);
    if (!remark) return; // user cancelled

    try 
    {
        const reviewDate = new Date().toLocaleDateString();

            const updatedArticle =
                await articleService.updateArticle( articleId,
                    {
                        status: action,
                        remark: remark,
                        reviewDate: reviewDate,
                        reviewedBy: loggedUser.userId
                    }
                );

        // Update local cache so re-render reflects the change instantly
        const idx = localArticles.findIndex(a => a.id == articleId);
        if (idx !== -1) {
            localArticles[idx].status     = action;
            localArticles[idx].remark     = remark;
            localArticles[idx].reviewDate = reviewDate;
        }

        renderCards();

    } 
    catch (err) 
    {
        console.error(err);
        alert("Update failed: " + err.message);
    }

    
});

$("#adminLogout").on("click",function(){
        handleLogout()
    })