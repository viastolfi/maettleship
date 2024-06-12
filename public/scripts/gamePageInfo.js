document.addEventListener('DOMContentLoaded', async () => {
    const playerInfoDiv = document.getElementById('playerInfo');

    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const userInfo = await response.json();
            playerInfoDiv.textContent = `Logged in as: ${userInfo.pseudo}`;
        } else {
            playerInfoDiv.textContent = 'Error: Could not retrieve user information.';
        }
    } catch (error) {
        playerInfoDiv.textContent = `Error: ${error.message}`;
    }
});