document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();

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

document.getElementById('logInForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const pseudo = document.getElementById('pseudoLogIn').value;
    const password = document.getElementById('passwordLogIn').value;
    const messageDiv = document.getElementById('messageLogIn');

    try {
        const response = await fetch('/logIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pseudo, password }),
        });

        const result = await response.json();
        
        if (response.ok) {
            messageDiv.textContent = 'User logged in successfully!';
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