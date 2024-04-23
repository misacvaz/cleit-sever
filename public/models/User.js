class User {

    constructor(name, gender, birth, country, email, password, photo, admin) {
        // The ID is not set in the constructor; this might be because it's assigned later, such as after creating the user on the server.
        this._id = undefined; // Ensure the ID is assigned when needed
        // Initialize the basic attributes of the user
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date(); // Set the registration date to the current date
    }

    // Getters for accessing private attributes
    get id() {
        return this._id;
    }

    get register() {
        return this._register;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get photo() {
        return this._photo;
    }

    get password() {
        return this._password;
    }

    get admin() {
        return this._admin;
    }

    // Setter for the photo attribute
    set photo(value) {
        this._photo = value; // Allows changing the user's photo
    }

    // Method to load user data from JSON
    loadFromJSON(json) {
        // This method fills the attributes of the object from a JSON object
        for (let name in json) {
            switch(name) {
                case '_register':
                    this[name] = new Date(json[name]); // Convert the value to a Date object
                    break;
                default:
                    // If the name starts with '_', update the corresponding value
                    if(name.startsWith('_')) this[name] = json[name];
            }
        }
    }

    // Method to get the list of users from an endpoint
    static getUsersStorage() {
           //return HttpRequest.get('/users');
        // Use the Fetch class to retrieve user data
        return Fetch.get('/users'); // Ensure this endpoint is correct and functioning
    }

    // Convert the User object to a JSON representation
    toJSON() {
        // Create a JSON object from the current User object
        let json = {};

        // Iterate over the attributes of the object and add them to the JSON object
        Object.keys(this).forEach(key => {
            if (this[key] !== undefined) json[key] = this[key]; // Add if the value is not undefined
        });

        return json;
    }

    // Method to save the user (either create or update)
    save() {
        // Return a Promise to indicate when the operation is complete
        return new Promise((resolve, reject) => {
            let promise;

            // Decide whether to use POST or PUT depending on if the ID is set
            if (this.id) {
                 // promese =  HttpRequest.put(`/users/${this.id}`,this.toJSON())
                promise = Fetch.put(`/users/${this.id}`, this.toJSON()); // Update an existing user
            } else {
                  //promese =  HttpRequest.post(`/users`,this.toJSON())
                promise = Fetch.post('/users', this.toJSON()); // Create a new user
            }

            // After the operation, load the returned data and resolve the Promise
            promise.then(data => {
                this.loadFromJSON(data); // Load the returned data
                resolve(this); // Indicate the operation was successful
            }).catch(e => {
                reject(e); // Reject the Promise in case of an error
            });
        });
    }

    // Method to delete a user
    remove() {

         //return HttpRequest.delete(`/users/${this.id}`)
        // Use the Fetch class to send a DELETE request to the server
        return Fetch.delete(`/users/${this.id}`); // Ensure `_id` is set before attempting to delete
    }

}
