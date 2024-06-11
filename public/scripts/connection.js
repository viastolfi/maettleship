document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const pseudo = document.getElementById('pseudo').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    console.log("test")

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pseudo, password }),
        });

        if (response.ok) {
            messageDiv.textContent = 'User registered successfully!';
            messageDiv.style.color = 'green';
        } else {
            const errorText = await response.text();
            messageDiv.textContent = `Error: ${errorText}`;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }
});