import bcrypt from "https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/+esm";
import { API } from './shared.js'; // Import API from shared.js
import { UserService } from './services/userService.js';

$(document).ready(function()
{

    const userService = new UserService(API);

    //custom rule for date 
    $.validator.addMethod(
        //rule name
        "validDob" ,

        //function that checks the value
        function(value , element)
        {
            if(this.optional(element))
            {
                return true;
            }

            const dob = new Date(value)
            const today = new Date()

            let age = today.getFullYear() - dob.getFullYear();

            let monthDiff = today.getMonth() - dob.getMonth()

            if( monthDiff < 0 || (monthDiff === 0  &&  today.getDate() < dob.getDate()))
            {
                age -- ;
            }

            return age > 18 && age < 80;
            
        } ,

        //message to display the user if the result is false
        "Age must be between 18 and 80 years."
    )
    
    let signUpValidator // used to reset the form

    //sign up form jquery validation 
    signUpValidator = $("#signUpForm").validate(
    {
        errorElement: "small",
        errorClass: "text-danger",
        
        rules:
        {
            "s-firstName" : 
            {
                required : true , 
                minlength:3 , 
                maxlength : 20
            } ,
            
            "s-lastName" : 
            {
                required : true , 
                minlength:3 , 
                maxlength : 20
            } ,

            "s-email" :
            {
                required : true,
                email :true
            },

            "s-dateOfBirth" :
            {
                required :true,
                validDob :true
            },

            "gender" : {required : true} ,
            "s-role" : {required : true},

            "s-userId" : 
            {
                required : true,
                pattern : /^(?=.*[a-z])(?=.*\d)[a-z\d]{4,9}$/,
            },

            "s-bio":
            {
                required : true , 
                minlength: 0 , 
                maxlength : 200
            },

            "s-password" :
            {
                required : true,
                pattern : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@$#&*])[a-zA-z\d!@$#&*]{8,15}$/,
            },

            "s-conformPassword" :
            {
                required:true,
                equalTo : "#s-password"
            }

        },

        messages :
        {
            "s-firstName" : 
            {
                required : "Please Enter the First Name", 
                minlength: "Kindly enter minimun 2 character " , 
                maxlength : "Maximum length should not exceed 20 character"
            } ,
            
            "s-lastName" : 
            {
                required : "Please Enter the First Name" , 
                minlength: "Kindly enter minimun 2 character " , 
                maxlength : "Maximum length should not exceed 20 character"
            } ,

            "s-email" :
            {
                required : "Please Enter the Email " , 
                email : "Please Enter valid Email" , 
            },

            "s-dateOfBirth" :
            {
                required : "Please Enter the date of birth ",
            },

            "gender" : {required :  "Please Enter the gender "} ,
            "s-role" : {required : "Please Enter the role "},

            "s-userId" : 
            {
                required : "Please Enter the Userid",
                pattern : "Kindly include atlest one digit , one small case letter only digit and lower case letters are allowed and length should be 4-8"
            },

            "s-bio":
            {
                required : "Please Enter the bio",
                minlength: "Kindly enter minimun 10 character ", 
                maxlength : "Maximum length should not exceed 200 character"
            },

            "s-password" :
            {
                required : "Please Enter the password",
                pattern : "Password must be 8-15 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character (!@$#&*)."
            },

            "s-conformPassword" :
            {
                required: "Please Enter the Conform Password ",
                equalTo : "The password dose not match"
            }
        },
        
        submitHandler: function (form) { signUp(); }
    })

    //used to clear the sign up form 
  
    // $("#clearSignUp").on("click", clearSignUp)

    // function that working after the validation is performed in the registration
    async function signUp()
    {
        // get the email 
        const email  = $("#s-email").val().trim();
        // get the user id
        const userId = $("#s-userId").val().trim();

        try 
        {
            // Check email duplicate
            const emailData = await userService.getUserByEmail(email);

            if (emailData.length > 0) 
            {
                // emailExists = true;
                $("#s-email").removeClass("is-valid").addClass("is-invalid");
                $("#sd-email").show().text("Email already registered");
                Swal.fire({ icon: "error", title: "Email already registered" });
                return;
            }

            // Check userId duplicate
            const userIdData = await userService.getUserByUserId(userId);

            if (userIdData.length > 0) 
            {
                // userIdExists = true;
                $("#s-userId").removeClass("is-valid").addClass("is-invalid");
                $("#sd-userId").show().text("User ID already exists");
                Swal.fire({ icon: "error", title: "User ID already exists" });
                return;
            }

            const password = $("#s-password").val().trim();
            const hashedPassword = bcrypt.hashSync(password, 10);

            // Build user object
            const userData = {
                firstName: $("#s-firstName").val().trim(),
                lastName: $("#s-lastName").val().trim(),
                email: email,
                userId: $("#s-userId").val().trim(),
                password: hashedPassword,
                dateOfBirth: $("#s-dateOfBirth").val(),
                gender:$("input[name='gender']:checked").val(),
                role:$("#s-role").val(),
                bio:  $("#s-bio").val().trim(),
                createdDate: new Date().toISOString()
            };

            // POST 
            await userService.createUser(userData);

            //used to clear the sign up form 
            // clearSignUp();

            // give succefully post message 
            await Swal.fire({ icon: "success", title: "Successfully signed up!", text: "You can now log in." })
            .then(() => {

                    const signupModal = bootstrap.Modal.getInstance(document.getElementById("signUpModal"));
                    signupModal.hide();
                    // Close sign-up modal, open login modal
                    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
                    loginModal.show();
                });


        } 

        catch (err) 
        {
            console.error("SIGN UP ERROR:", err);
            await Swal.fire({ icon: "error", title: "Cannot connect to server", text: "Please try again later." });
        }

    }

    //function that works on the login 
    $("#loginBtn").on("click", async function (e)
        {
            e.preventDefault();
            console.log("1st click")

            const userId = $("#l-userId").val().trim();
            const password = $("#l-password").val().trim();

            console.log(userId)

            if (!userId || !password)
            {
                Swal.fire({icon: "warning",title: "Please enter User ID and Password"});
                return;
            }

            try
            {
                const users = await userService.getUserByUserId(userId);

                if (users.length === 0)
                {
                    Swal.fire({icon: "error",title: "User ID Not Found"});
                    return;
                }

                const user = users[0];

                const isValid = bcrypt.compareSync( password, user.password);


                if (!isValid)
                {
                    Swal.fire({icon: "error",title: "Incorrect Password"});
                    return;
                }

                // Store logged-in user (without password)
                const { password: _pw, ...safeUser } = user;
                localStorage.setItem("loggedUser", JSON.stringify(safeUser));

                await Swal.fire({icon: "success",title: "Login Successful!",text: `Welcome, ${user.firstName}!`,timer: 1500,showConfirmButton: false})
                .then(()=>
                {
                    // Redirect based on role
                    if (user.role === "Reader")
                    {
                        window.location.href = "../pages/userDashboard.html";
                    }
                    else if (user.role === "Author")
                    {
                        window.location.href = "../pages/authorDashboard.html";
                    }
                    else if (user.role === "Admin")
                    {
                        window.location.href = "../pages/adminDashboard.html";
                    }

                })

                
            }
            
            catch (err)
            {
                Swal.fire({icon: "error",title: "Cannot connect to server"});
            }
        });

});  