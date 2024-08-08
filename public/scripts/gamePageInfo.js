function deleteCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

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
            deleteCookie('authToken');
            window.location.href = '/';
        } else if (!response.ok) {
            deleteCookie('authToken');
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