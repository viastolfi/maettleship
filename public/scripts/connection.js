document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const pseudo = document.getElementById('pseudo').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pseudo, password }),
        });

        const result = await response.json();
        console.log("test")
        console.log(result)
        
        if (response.ok) {
            messageDiv.textContent = 'User registered successfully!';
            messageDiv.style.color = 'green';
            window.location.href = result.redirectUrl;
        } else {
            messageDiv.textContent = `Error: ${result.message || 'Unknown error'}`;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.log("testE")
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }
});