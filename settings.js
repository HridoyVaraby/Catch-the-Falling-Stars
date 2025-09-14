document.addEventListener('DOMContentLoaded', () => {
    const musicVolume = document.getElementById('musicVolume');
    const sfxVolume = document.getElementById('sfxVolume');

    // Load saved volume settings
    const savedMusicVolume = localStorage.getItem('musicVolume') || 0.5;
    const savedSfxVolume = localStorage.getItem('sfxVolume') || 0.5;

    // Set initial values
    musicVolume.value = savedMusicVolume;
    sfxVolume.value = savedSfxVolume;

    // Handle volume changes
    musicVolume.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        localStorage.setItem('musicVolume', volume);
    });

    sfxVolume.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        localStorage.setItem('sfxVolume', volume);
    });
});