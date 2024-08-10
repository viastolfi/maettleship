document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const pseudo = document.getElementById('pseudo').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    const hashedPassword = CryptoJS.SHA256(password).toString();

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pseudo, password: hashedPassword }),
        });

        const result = await response.json();
        
        if (response.ok) {
            messageDiv.textContent = 'User registered successfully!';
            messageDiv.style.color = 'green';
            window.location.href = result.redirectUrl;
        } else {
            messageDiv.textContent = `Error: ${result.message || 'Unknown error'}`;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.location.href = '/game';
        } else {
            console.error("no token found")
        }
    } catch (error) {
        console.error("Error : ", error)
    }
});