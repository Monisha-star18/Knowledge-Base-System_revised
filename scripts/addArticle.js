// // Current Date  
// const today = new Date();
// const displayDate = today.toDateString();
// document.getElementById('created-date').textContent = 'Created: ' + displayDate;

// // ── Edit Mode Detection 
// const urlParams = new URLSearchParams(window.location.search);
// const editId = urlParams.get('id');
// const isEditMode = !!editId;

// let originalArticle = null; // stores original article data in edit mode

// // ── Edit Mode 
// if (isEditMode) 
// {

//     // update page title and header text
//     document.title = 'Edit Article – InsightHub';
//     const headingEl = document.querySelector('.header-heading');
//     const subEl = document.querySelector('.header-sub');
//     if (headingEl) headingEl.textContent = 'Edit Article';
//     if (subEl) subEl.textContent = 'Update the details below and resubmit for review.';

//     // change submit button label to update
//     const submitBtn = document.querySelector('.btn-submit');
//     if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Update Article';

//     // change date label to update date
//     const date = document.getElementById('created-date');
//     if (date) date.textContent = 'Update Date : ' + displayDate;

//     // fetch the existing article and fill the form
//     async function loadArticle(editId) 
//     {
//         try 
//         {
//             const res = await fetch(`${API}/articles/${editId}`);
//             if (!res.ok) throw new Error('Article not found');

//             const article = await res.json();
//             originalArticle = article;

//             // fill all form fields with existing article data
//             document.getElementById('articleTitle').value    = article.title;
//             document.getElementById('articleSubtitle').value = article.subtitle;
//             document.getElementById('articleCategory').value = article.category;
//             document.getElementById('articleIntro').value    = article.intro;
//             document.getElementById('articleContent').value  = article.content;

//             // show admin remark if available
//             if (article.remark) {
//                 const dateEl = document.getElementById('created-date');
//                 if (dateEl) {
//                     const badgeDiv = dateEl.closest('.date-badge');
//                     badgeDiv.parentElement.style.flexWrap = 'wrap';
//                     badgeDiv.insertAdjacentHTML('afterend', `
//                         <div class="alert alert-warning mt-2 mb-0 w-100" style="font-size:0.85rem;">
//                             <i class="fa-solid fa-comment"></i> <strong>Admin Remark:</strong> ${article.remark}
//                         </div>
//                     `);
//                 }
//             }
//         } 
//         catch (err) 
//         {
//             console.error(err);
//             await Swal.fire({ icon: 'error', title: 'Could not load article', text: 'Redirecting to dashboard.' });
//             window.location.href = '../pages/authorDashboard.html';
//         }
//     }

    
//     loadArticle(editId);
// }

// // ── Clear Form ─
// function clearForm() 
// {
//     Swal.fire({ title: 'Clear form?', text: 'All entered content will be removed.', icon: 'warning', showCancelButton: true })
//         .then(result => {
//             if (result.isConfirmed) 
//             {
//                 document.getElementById('articleForm').reset();
//                 document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
//             }
//         });
// }

// // ── Validation 
// // Returns true if field has a value, false and marks invalid if empty
// // function validate(id) 
// // {
// //     const element = document.getElementById(id);
   
// //     const empty = element.value.trim() === '';
// //     element.classList.toggle('is-invalid', empty);
// //     return !empty;


// // }
// // ── shared regex: letters and spaces only ──
// const allowedTextRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9. ]+$/;
// function validate(id) 
// {
//     const element = document.getElementById(id);
//     const value = element.value.trim();
//     const msgEl = element.closest('.mb-field').querySelector('.invalid-msg');

//     // check 1 — empty
//     if (value === '') 
//     {
//         element.classList.add('is-invalid');
//         if (msgEl) msgEl.textContent = 'This field is required.';
//         return false;
//     }

//     // check 2 — letters and spaces only
//     if (!allowedTextRegex.test(value)) 
//     {
//         element.classList.add('is-invalid');
//         if (msgEl) msgEl.textContent = 'Only number not  are allowed.';
//         return false;
//     }

//     element.classList.remove('is-invalid');
//     if (msgEl) msgEl.textContent = '';
//     return true;
// }

// // ── Form Submit
// document.getElementById('articleForm').addEventListener('submit', async function (e) 
// {
//     e.preventDefault();

//     // check session
//     const loggedUserStr = localStorage.getItem('loggedUser');
//     if (!loggedUserStr) {
//         Swal.fire({ icon: 'error', title: 'Session Expired', text: 'Please log in again.' });
//         return;
//     }
//     const loggedUser = JSON.parse(loggedUserStr);

//     // validate all fields before submitting
//     const ok = [
//         validate('articleTitle'),validate('articleCategory'),
//         validate('articleSubtitle'),validate('articleIntro'),
//         validate('articleContent')
//     ].every(Boolean);

//     if (!ok) return;

//     try 
//     {
//         // ── EDIT MODE
//         if (isEditMode) 
//         {

//             const updatedArticle = 
//             {
//                 ...originalArticle,  // keep image, authorId, authorName, createdAt etc.
//                 title:      document.getElementById('articleTitle').value.trim(),
//                 subtitle:   document.getElementById('articleSubtitle').value.trim(),
//                 category:   document.getElementById('articleCategory').value,
//                 intro:      document.getElementById('articleIntro').value.trim(),
//                 content:    document.getElementById('articleContent').value.trim(),
//                 status:     'pending', // reset to pending for re-review
//                 reviewDate: null,
//                 updatedAt:  displayDate // today's date auto-set
//             };

//             // check if anything actually changed compared to original
//             const hasChanged =
//                 updatedArticle.title    !== originalArticle.title    ||
//                 updatedArticle.subtitle !== originalArticle.subtitle ||
//                 updatedArticle.category !== originalArticle.category ||
//                 updatedArticle.intro    !== originalArticle.intro    ||
//                 updatedArticle.content  !== originalArticle.content;

//             // nothing changed — block update
//             if (!hasChanged) {
//                 Swal.fire({ icon: 'info', title: 'No changes made', text: 'Nothing was updated.' });
//                 return;
//             }

//             // something changed — ask for confirmation before saving
//             const confirm = await Swal.fire({
//                 icon: 'question',title: 'Update Article?',
//                 text: 'Are you sure you want to resubmit this article for review?',
//                 showCancelButton: true,confirmButtonText: 'Yes, Update'});

//             if (!confirm.isConfirmed) return;

//             const saveRes = await fetch(`${API}/articles/${editId}`, {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(updatedArticle)
//             });

//             if (!saveRes.ok) throw new Error('Could not update.');

//             Swal.fire({ icon: 'success', title: 'Article updated!', text: 'Resubmitted for review.' })
//                 .then(() => { window.location.href = '../pages/authorDashboard.html'; });

       
//         } 

//          // ── CREATE MODE
//         else 
//         {
//             // count existing articles by this author to generate a unique image seed
//             const countRes = await fetch(`${API}/articles?authorId=${loggedUser.id}`);
//             const existingArticles = await countRes.json();
//             const nextIndex = existingArticles.length + 1;

//             const article = {
//                 authorId:   loggedUser.id,
//                 authorName: `${loggedUser.firstName} ${loggedUser.lastName}`,
//                 title:      document.getElementById('articleTitle').value.trim(),
//                 category:   document.getElementById('articleCategory').value,
//                 subtitle:   document.getElementById('articleSubtitle').value.trim(),
//                 intro:      document.getElementById('articleIntro').value.trim(),
//                 content:    document.getElementById('articleContent').value.trim(),
//                 image:      `https://picsum.photos/seed/article${nextIndex}/800/300`,
//                 createdAt:  displayDate,
//                 status:     'pending',
//                 reviewDate: null,
//                 isDeleted:  false
//             };

//             const saveRes = await fetch(`${API}/articles`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(article)
//             });

//             if (!saveRes.ok) throw new Error('Could not post.');

//             Swal.fire({ icon: 'success', title: 'Article submitted!' })
//                 .then(() => { window.location.href = '../pages/authorDashboard.html'; });
//         }

//     } 
    
//     catch (err) 
//     {
//         console.error(err);
//         Swal.fire({ icon: 'error', title: isEditMode ? 'Update Failed' : 'Submission Failed' });
//     }
// });

// // Clears red border as soon as user starts typing in any field
// document.querySelectorAll('.field-input, .field-select, .field-textarea').forEach(formElement => {
//     formElement.addEventListener('input',  () => formElement.classList.remove('is-invalid'));
//     formElement.addEventListener('change', () => formElement.classList.remove('is-invalid'));
// });

$(document).ready(function () {

    // =========================================================
    // 1. UI SERVICE
    // Handles UI-related reusable operations
    // =========================================================

    class UIService {

        // Show SweetAlert
        async showAlert(icon, title, text = "") {
            return await Swal.fire({
                icon: icon,
                title: title,
                text: text
            });
        }

        // Redirect to author dashboard
        redirectToDashboard() {
            window.location.href = "../pages/authorDashboard.html";
        }

        // Update page title and heading
        setEditModeUI() {

            document.title = "Edit Article – InsightHub";

            const heading = document.querySelector(".header-heading");
            const subHeading = document.querySelector(".header-sub");
            const submitBtn = document.querySelector(".btn-submit");
            const dateElement = document.getElementById("created-date");

            if (heading) {
                heading.textContent = "Edit Article";
            }

            if (subHeading) {
                subHeading.textContent =
                    "Update the details below and resubmit for review.";
            }

            if (submitBtn) {
                submitBtn.innerHTML =
                    '<i class="fa-solid fa-paper-plane"></i> Update Article';
            }

            if (dateElement) {
                dateElement.textContent =
                    "Update Date : " + this.getCurrentDate();
            }
        }

        // Display current date
        getCurrentDate() {

            const today = new Date();

            return today.toDateString();
        }

        // Set created date
        setCreatedDate() {

            const dateElement =
                document.getElementById("created-date");

            if (dateElement) {

                dateElement.textContent =
                    "Created: " + this.getCurrentDate();
            }
        }

        // Show admin remark
        showAdminRemark(remark) {

            if (!remark) {
                return;
            }

            const dateElement =
                document.getElementById("created-date");

            if (!dateElement) {
                return;
            }

            const badgeDiv =
                dateElement.closest(".date-badge");

            if (!badgeDiv) {
                return;
            }

            badgeDiv.parentElement.style.flexWrap = "wrap";

            badgeDiv.insertAdjacentHTML(
                "afterend",
                `
                <div class="alert alert-warning mt-2 mb-0 w-100"
                     style="font-size:0.85rem;">

                    <i class="fa-solid fa-comment"></i>

                    <strong>Admin Remark:</strong>

                    ${remark}

                </div>
                `
            );
        }
    }


    // =========================================================
    // 2. ARTICLE SERVICE
    // Handles API / database operations
    // =========================================================

    class ArticleService {

        // Get one article
        async getArticle(id) {

            const response =
                await fetch(`${API}/articles/${id}`);

            if (!response.ok) {
                throw new Error("Article not found");
            }

            return await response.json();
        }


        // Get all articles of an author
        async getArticlesByAuthor(authorId) {

            const response =
                await fetch(
                    `${API}/articles?authorId=${authorId}`
                );

            if (!response.ok) {
                throw new Error("Could not get articles");
            }

            return await response.json();
        }


        // Create article
        async createArticle(article) {

            const response =
                await fetch(`${API}/articles`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(article)
                });

            if (!response.ok) {
                throw new Error("Could not create article");
            }

            return await response.json();
        }


        // Update article
        async updateArticle(id, article) {

            const response =
                await fetch(`${API}/articles/${id}`, {

                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(article)
                });

            if (!response.ok) {
                throw new Error("Could not update article");
            }

            return await response.json();
        }
    }


    // =========================================================
    // 3. ARTICLE FORM
    // Handles form-related operations
    // =========================================================

    class ArticleForm {

        constructor() {

            this.form =
                document.getElementById("articleForm");
        }


        // Get value from input
        getValue(id) {

            const element =
                document.getElementById(id);

            return element.value.trim();
        }


        // Get category
        getCategory() {

            return document
                .getElementById("articleCategory")
                .value;
        }


        // Get all form data
        getData() {

            return {

                title:
                    this.getValue("articleTitle"),

                subtitle:
                    this.getValue("articleSubtitle"),

                category:
                    this.getCategory(),

                intro:
                    this.getValue("articleIntro"),

                content:
                    this.getValue("articleContent")
            };
        }


        // Fill form with article data
        fillForm(article) {

            document.getElementById("articleTitle").value =
                article.title;

            document.getElementById("articleSubtitle").value =
                article.subtitle;

            document.getElementById("articleCategory").value =
                article.category;

            document.getElementById("articleIntro").value =
                article.intro;

            document.getElementById("articleContent").value =
                article.content;
        }


        // Clear form
        reset() {

            this.form.reset();

            document
                .querySelectorAll(".is-invalid")
                .forEach(element => {

                    element.classList.remove("is-invalid");
                });
        }


        // Validate one field
        validateField(id) {

            const element =
                document.getElementById(id);

            const value =
                element.value.trim();

            const msgElement =
                element
                    .closest(".mb-field")
                    ?.querySelector(".invalid-msg");


            // Empty validation
            if (value === "") {

                element.classList.add("is-invalid");

                if (msgElement) {
                    msgElement.textContent =
                        "This field is required.";
                }

                return false;
            }


            // Regex validation
            if (!allowedTextRegex.test(value)) {

                element.classList.add("is-invalid");

                if (msgElement) {
                    msgElement.textContent =
                        "Only letters, numbers, spaces and dots are allowed.";
                }

                return false;
            }


            // Valid
            element.classList.remove("is-invalid");

            if (msgElement) {
                msgElement.textContent = "";
            }

            return true;
        }


        // Validate complete form
        validateForm() {

            const fields = [

                "articleTitle",

                "articleCategory",

                "articleSubtitle",

                "articleIntro",

                "articleContent"
            ];


            return fields
                .map(id => this.validateField(id))
                .every(Boolean);
        }


        // Remove validation error while typing
        enableLiveValidation() {

            document
                .querySelectorAll(
                    ".field-input, .field-select, .field-textarea"
                )
                .forEach(element => {

                    element.addEventListener(
                        "input",
                        () => {

                            element.classList.remove(
                                "is-invalid"
                            );
                        }
                    );


                    element.addEventListener(
                        "change",
                        () => {

                            element.classList.remove(
                                "is-invalid"
                            );
                        }
                    );
                });
        }
    }


    // =========================================================
    // 4. ARTICLE MANAGER
    // Handles Create / Update business logic
    // =========================================================

    class ArticleManager {

        constructor(articleService, articleForm, uiService) {

            this.articleService = articleService;

            this.articleForm = articleForm;

            this.uiService = uiService;

            this.originalArticle = null;
        }


        // =====================================================
        // LOAD ARTICLE FOR EDIT
        // =====================================================

        async loadArticle(id) {

            try {

                const article =
                    await this.articleService.getArticle(id);

                this.originalArticle = article;

                // Fill form
                this.articleForm.fillForm(article);

                // Show admin remark
                this.uiService.showAdminRemark(
                    article.remark
                );

            }
            catch (error) {

                console.error(error);

                await this.uiService.showAlert(
                    "error",
                    "Could not load article",
                    "Redirecting to dashboard."
                );

                this.uiService.redirectToDashboard();
            }
        }


        // =====================================================
        // CREATE ARTICLE
        // =====================================================

        async createArticle(loggedUser) {

            try {

                // Get existing articles
                const articles =
                    await this.articleService
                        .getArticlesByAuthor(
                            loggedUser.id
                        );


                // Generate next image number
                const nextIndex =
                    articles.length + 1;


                // Get form data
                const formData =
                    this.articleForm.getData();


                // Create article object
                const article = {

                    authorId:
                        loggedUser.id,

                    authorName:
                        `${loggedUser.firstName} ${loggedUser.lastName}`,

                    title:
                        formData.title,

                    category:
                        formData.category,

                    subtitle:
                        formData.subtitle,

                    intro:
                        formData.intro,

                    content:
                        formData.content,

                    image:
                        `https://picsum.photos/seed/article${nextIndex}/800/300`,

                    createdAt:
                        this.uiService.getCurrentDate(),

                    status:
                        "pending",

                    reviewDate:
                        null,

                    isDeleted:
                        false
                };


                // Save article
                await this.articleService
                    .createArticle(article);


                // Success message
                await this.uiService.showAlert(
                    "success",
                    "Article submitted!"
                );


                // Redirect
                this.uiService.redirectToDashboard();

            }
            catch (error) {

                console.error(error);

                await this.uiService.showAlert(
                    "error",
                    "Submission Failed"
                );
            }
        }


        // =====================================================
        // CHECK WHETHER ARTICLE CHANGED
        // =====================================================

        hasArticleChanged(updatedArticle) {

            return (

                updatedArticle.title !==
                    this.originalArticle.title ||

                updatedArticle.subtitle !==
                    this.originalArticle.subtitle ||

                updatedArticle.category !==
                    this.originalArticle.category ||

                updatedArticle.intro !==
                    this.originalArticle.intro ||

                updatedArticle.content !==
                    this.originalArticle.content
            );
        }


        // =====================================================
        // UPDATE ARTICLE
        // =====================================================

        async updateArticle(id) {

            try {

                // Get current form values
                const formData =
                    this.articleForm.getData();


                // Create updated object
                const updatedArticle = {

                    ...this.originalArticle,

                    title:
                        formData.title,

                    subtitle:
                        formData.subtitle,

                    category:
                        formData.category,

                    intro:
                        formData.intro,

                    content:
                        formData.content,

                    status:
                        "pending",

                    reviewDate:
                        null,

                    updatedAt:
                        this.uiService.getCurrentDate()
                };


                // Check whether something changed
                const hasChanged =
                    this.hasArticleChanged(
                        updatedArticle
                    );


                // Nothing changed
                if (!hasChanged) {

                    await this.uiService.showAlert(
                        "info",
                        "No changes made",
                        "Nothing was updated."
                    );

                    return;
                }


                // Confirmation
                const confirmation =
                    await Swal.fire({

                        icon: "question",

                        title: "Update Article?",

                        text:
                            "Are you sure you want to resubmit this article for review?",

                        showCancelButton: true,

                        confirmButtonText:
                            "Yes, Update"
                    });


                // User cancelled
                if (!confirmation.isConfirmed) {
                    return;
                }


                // Update API
                await this.articleService
                    .updateArticle(
                        id,
                        updatedArticle
                    );


                // Success
                await this.uiService.showAlert(
                    "success",
                    "Article updated!",
                    "Resubmitted for review."
                );


                // Redirect
                this.uiService.redirectToDashboard();

            }
            catch (error) {

                console.error(error);

                await this.uiService.showAlert(
                    "error",
                    "Update Failed"
                );
            }
        }
    }


    // =========================================================
    // 5. APP CLASS
    // Connects everything together
    // =========================================================

    class ArticleApp {

        constructor() {

            // Create objects
            this.ui =
                new UIService();

            this.articleService =
                new ArticleService();

            this.articleForm =
                new ArticleForm();

            this.articleManager =
                new ArticleManager(
                    this.articleService,
                    this.articleForm,
                    this.ui
                );


            // URL information
            const urlParams =
                new URLSearchParams(
                    window.location.search
                );

            this.editId =
                urlParams.get("id");

            this.isEditMode =
                !!this.editId;
        }


        // =====================================================
        // INITIALIZE APPLICATION
        // =====================================================

        async init() {

            // Set today's date
            this.ui.setCreatedDate();


            // Enable live validation
            this.articleForm
                .enableLiveValidation();


            // Clear button
            this.setupClearButton();


            // Form submit
            this.setupSubmit();


            // Edit mode
            if (this.isEditMode) {

                this.ui.setEditModeUI();

                await this.articleManager
                    .loadArticle(
                        this.editId
                    );
            }
        }


        // =====================================================
        // CLEAR BUTTON
        // =====================================================

        setupClearButton() {

            const clearButton =
                document.getElementById(
                    "clearForm"
                );


            if (!clearButton) {
                return;
            }


            clearButton.addEventListener(
                "click",
                async () => {

                    const result =
                        await Swal.fire({

                            title:
                                "Clear form?",

                            text:
                                "All entered content will be removed.",

                            icon:
                                "warning",

                            showCancelButton:
                                true
                        });


                    if (result.isConfirmed) {

                        this.articleForm.reset();
                    }
                }
            );
        }


        // =====================================================
        // FORM SUBMIT
        // =====================================================

        setupSubmit() {

            this.articleForm.form
                .addEventListener(
                    "submit",
                    async (event) => {

                        event.preventDefault();


                        // Check login
                        const loggedUserStr =
                            localStorage.getItem(
                                "loggedUser"
                            );


                        if (!loggedUserStr) {

                            await this.ui.showAlert(
                                "error",
                                "Session Expired",
                                "Please log in again."
                            );

                            return;
                        }


                        const loggedUser =
                            JSON.parse(
                                loggedUserStr
                            );


                        // Validate
                        const isValid =
                            this.articleForm
                                .validateForm();


                        if (!isValid) {
                            return;
                        }


                        // EDIT
                        if (this.isEditMode) {

                            await this.articleManager
                                .updateArticle(
                                    this.editId
                                );

                            return;
                        }


                        // CREATE
                        await this.articleManager
                            .createArticle(
                                loggedUser
                            );
                    }
                );
        }
    }


    // =========================================================
    // 6. SHARED REGEX
    // =========================================================

    const allowedTextRegex =
        /^(?=.*[a-zA-Z])[a-zA-Z0-9. ]+$/;


    // =========================================================
    // 7. START APPLICATION
    // =========================================================

    const app =
        new ArticleApp();

    app.init();

});