document.addEventListener('DOMContentLoaded', function(){
    const overlay = document.getElementById('overlay');
    const addCodeBtn = document.getElementById('add-code-btn');
    const closeBtn = document.getElementById('close-btn');
    const generateCodeBtn = document.getElementById('generate-invitation-code-btn');
    const codeDisplay = document.getElementById('generated-code');

    function generateCode() {
        return code = Math.floor(1000 + Math.random() * 9000);
    }

    function openOverlay() {
        overlay.style.display = 'block';
        codeDisplay.textContent = generateCode();
    }

    generateCodeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        openOverlay();
    });

    function closeOverlay() {
        overlay.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeOverlay);
});
