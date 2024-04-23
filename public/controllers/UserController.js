class UserController {

    // Constructor for initializing form elements and setting up event listeners
    constructor(formIdCreate, formIdUpdate, tableId) {
        // Get the form and table elements using the provided IDs
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        // Set up form submission and other event listeners
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    // Handles form editing events
    onEdit() {
        // Event listener for the "Cancel" button in the update form
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate(); // Show the create form and hide the update form
        });

        // Event listener for the update form submission
        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault(); // Prevent the default form submission behavior

            // Disable the submit button to avoid multiple submissions
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;

            // Get the updated values from the form
            let values = this.getValues(this.formUpdateEl);

            // Get the index of the row being edited and the existing user data
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];
            let userOld = JSON.parse(tr.dataset.user);

            // Merge the old and new data
            let result = Object.assign({}, userOld, values);

            // Handle the user photo update
            this.getPhoto(this.formUpdateEl).then(
                (content) => {
                    // If the photo is not changed, keep the old one
                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    // Create a User object and load the data
                    let user = new User();
                    user.loadFromJSON(result);

                    // Save the updated user
                    user.save().then(user => {
                        this.getTr(user, tr); // Update the table row with new data
                        this.updateCount(); // Update the user count
                        this.formUpdateEl.reset(); // Reset the update form
                        btn.disabled = false; // Re-enable the submit button
                        this.showPanelCreate(); // Switch back to the create form
                    });
                },
                (e) => {
                    console.error(e); // Log any errors
                }
            );
        });
    }

    // Handles form submission for creating new users
    onSubmit() {
        // Event listener for the create form submission
        this.formEl.addEventListener("submit", event => {
            event.preventDefault(); // Prevent default form submission

            // Disable the submit button to avoid multiple submissions
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;

            // Get form values for the new user
            let values = this.getValues(this.formEl);

            if (!values) return false; // Return if values are invalid

            // Handle user photo
            this.getPhoto(this.formEl).then(
                (content) => {
                    // Add the photo content to the user object
                    values.photo = content;

                    // Save the new user
                    values.save().then(user => {
                        this.addLine(values); // Add the new user to the table
                        this.formEl.reset(); // Reset the form
                        btn.disabled = false; // Re-enable the submit button
                    });
                },
                (e) => {
                    console.error(e); // Handle errors during photo processing
                }
            );
        });
    }

    // Reads and returns the user photo from the form
    getPhoto(formEl) {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader(); // Create a FileReader for reading files

            // Find the file input element for the photo
            let elements = [...formEl.elements].filter(item => item.name === 'photo');
            let file = elements[0].files[0]; // Get the first file (if any)

            // Set up event handlers for the FileReader
            fileReader.onload = () => resolve(fileReader.result); // Resolve with file content
            fileReader.onerror = (e) => reject(e); // Reject on error

            if (file) {
                fileReader.readAsDataURL(file); // Read the file content
            } else {
                resolve('dist/img/boxed-bg.jpg'); // Default image if no file is selected
            }
        });
    }

    // Retrieves user values from the form and creates a User object
    getValues(formEl) {
        let user = {}; // Object to hold user data
        let isValid = true; // Flag for form validation

        // Loop through form elements to extract values
        [...formEl.elements].forEach((field, index) => {
            if (['name', 'email', 'password'].includes(field.name) && !field.value) {
                // Check for required fields and mark them if empty
                field.parentElement.classList.add('has-error'); // Highlight the field with error
                isValid = false; // Form is invalid
            }

            // Handle gender field as a radio button
            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value; // Store the selected gender
                }
            } else if(field.name == "admin") {
                user[field.name] = field.checked; // Store the admin status as a boolean
            } else {
                user[field.name] = field.value; // Store other field values
            }
        });

        // If the form is invalid, return false
        if (!isValid) {
            return false;
        }

        // Create and return a new User object with the form data
        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }

    // Fetches and displays all existing users in the table
    selectAll() {
        User.getUsersStorage().then(data => {
            // Iterate through all users and add them to the table
            data.users.forEach(dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser); // Load the user data
                this.addLine(user); // Add the user to the table
            });
        });
    }

    // Adds a user to the table
    addLine(dataUser) {
        let tr = this.getTr(dataUser); // Create or update a table row
        this.tableEl.appendChild(tr); // Append the row to the table
        this.updateCount(); // Update the user count display
    }

    // Creates or updates a table row with user data
    getTr(dataUser, tr = null) {
        if (tr === null) tr = document.createElement('tr'); // Create a new row if needed

        tr.dataset.user = JSON.stringify(dataUser); // Store user data in the row

        // Define the inner HTML structure for the row
        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr); // Add event listeners for buttons
        return tr; // Return the updated table row
    }

    // Adds event listeners for edit and delete buttons in a table row
    addEventsTr(tr) {
        // Event listener for the delete button
        tr.querySelector(".btn-delete").addEventListener("click", e => {
            if (confirm("Do you really want to delete?")) {
                let user = new User(); // Create a User object
                user.loadFromJSON(JSON.parse(tr.dataset.user)); // Load the data

                // Attempt to delete the user and remove the row if successful
                user.remove().then(data => {
                    tr.remove(); // Remove the row from the table
                    this.updateCount(); // Update the user count display
                });
            }
        });

        // Event listener for the edit button
        tr.querySelector(".btn-edit").addEventListener("click", e => {
            let json = JSON.parse(tr.dataset.user); // Get user data from the row

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex; // Store the index of the row

            // Populate the update form with the existing user data
            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {
                    switch (field.type) {
                        case 'file': // Skip file fields
                            continue;
                        case 'radio': // Handle radio buttons
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true; // Check the correct option
                            break;
                        case 'checkbox': // Handle checkboxes
                            field.checked = json[name]; // Set the checkbox state
                            break;
                        default: // Set other field types
                            field.value = json[name];
                    }
                }
            }

            // Set the photo in the update form
            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate(); // Switch to the update panel
        });
    }

    // Shows the create panel and hides the update panel
    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = "block"; // Show the create panel
        document.querySelector("#box-user-update").style.display = "none"; // Hide the update panel
    }

    // Shows the update panel and hides the create panel
    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none"; // Hide the create panel
        document.querySelector("#box-user-update").style.display = "block"; // Show the update panel
    }

    // Updates the display of user counts (total and admin)
    updateCount() {
        let numberUsers = 0;
        let numberAdmin = 0;

        // Iterate through the table rows to count users and admins
        [...this.tableEl.children].forEach(tr => {
            numberUsers++; // Increment the total user count

            let user = JSON.parse(tr.dataset.user); // Get the user data

            if (user._admin) {
                numberAdmin++; // Increment the admin count if the user is an admin
            }
        });

        // Update the user and admin counts in the interface
        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }

}
