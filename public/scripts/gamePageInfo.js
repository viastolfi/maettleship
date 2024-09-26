document.addEventListener('DOMContentLoaded', async () => {
    const playerInfoDiv = document.getElementById('playerInfo');

    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            window.location.href = '/';
        } else if (!response.ok) {
            playerInfoDiv.textContent = 'Error: Could not retrieve user information.';
            window.location.href = '/';
        } else {
            const userInfo = await response.json();
            playerInfoDiv.textContent = `Logged in as: ${userInfo.pseudo}`;
        }
    } catch (error) {
        playerInfoDiv.textContent = `Error: ${error.message}`;
    }
});