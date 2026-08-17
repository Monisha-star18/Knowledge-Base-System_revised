export  class UserService {

    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }


    // GET - Get user by email
    async getUserByEmail(email) {

        const res = await fetch(`${this.apiUrl}/users?email=${email}`);

        if (!res.ok) {throw new Error("Failed to fetch user by email");}

        return await res.json();
    }


    // GET - Get user by User ID
    async getUserByUserId(userId) {

        const res = await fetch(`${this.apiUrl}/users?userId=${userId}`);

        if (!res.ok) { throw new Error("Failed to fetch user by User ID");}

        return await res.json();
    }


    // POST - Create user
    async createUser(userData) {

        const res = await fetch(`${this.apiUrl}/users`,
            {
                method: "POST",

                headers: {"Content-Type": "application/json"},

                body: JSON.stringify(userData)
            }
        );

        if (!res.ok) {throw new Error("Could not create account");}

        return await res.json();
    }

}