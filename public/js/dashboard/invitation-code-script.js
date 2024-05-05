document.addEventListener('DOMContentLoaded', function(){
    const generateCodeBtn = document.getElementById('generate-invitation-code-btn');
    generateCodeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const code = Math.floor(1000 + Math.random() * 9000);
        document.getElementById('new-code').value = code;
    });
});
