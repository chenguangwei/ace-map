const prevTheme = JSON.parse(localStorage.getItem('theme') ?? '"light"');
if (prevTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('color-scheme', 'dark');
} else {
    document.documentElement.style.setProperty('color-scheme', 'light');
}
