document.addEventListener('DOMContentLoaded', function(){
    /*************************** SELECT ELEMENTS ***************************/
    const generateCodeBtn = document.getElementById('generate-invitation-code-btn');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('close-btn');
    // Add invitation code form
    const addCodeForm = document.querySelector('form[action="/add-invitation-code"]');
    const codeList = addCodeForm.querySelectorAll('.invitation-code-inputs input');
    const codeMessage = addCodeForm.querySelector('.message');
    // Toast notification
    const toastNotification = document.getElementById('invitation-code-toast-notification');
    const toastNotificationMessage = toastNotification.querySelector('span');
    const toastNotificationClose = toastNotification.querySelector('button');


    /*************************** ON PAGE LOAD ***************************/
    if (sessionStorage.getItem('codeOverlay') === 'show') {
        openOverlay();
        fillInCode();

        const messageHistory = sessionStorage.getItem('message-history');
        if (messageHistory) {
            const parsedHistory = JSON.parse(messageHistory);
            if (parsedHistory.display === 'show') {
                showMessage(parsedHistory.content, parsedHistory.style);
            }
        }
    }

    const toastNotificationHistory = sessionStorage.getItem('toast-notification-history');
    if (toastNotificationHistory) {
        const parsedHistory = JSON.parse(toastNotificationHistory);
        if (parsedHistory.display === 'show') {
            showToastNotification(parsedHistory.content, parsedHistory.style);
        }
    }



    /*************************** EVENT LISTENERS ***************************/
    // Initialize overlay
    generateCodeBtn.addEventListener('click', function(event) {
        event.preventDefault();
        openOverlay();
        fillInCode();
    });

    // Finalize overlay
    closeBtn.addEventListener('click', closeOverlay);

    // Ensure consecutive inputs
    codeList.forEach((code, index) => {
        code.addEventListener('input', function() {
            // Ensure only digits are entered
            this.value = this.value.replace(/\D/g, '');

            hideMessage();

            if (this.value.length === 1) {
                let first = index;
                while (first > 0 && codeList[first - 1].value.length === 0) {
                    first--;
                }

                if (first === index) {
                    if (index < codeList.length - 1) {
                        codeList[index + 1].focus();
                    }
                } else {
                    codeList[first].value = this.value;
                    codeList[first + 1].focus();
                    codeList[index].value = '';
                }
            } else if (this.value.length === 0 && index > 0) {
                codeList[index - 1].focus();
            }
        });
    });

    // Check if code is valid
    addCodeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (hasEmptyfields(codeList)) {
            showMessage('Must be a 4-digit code.', 'error');
            return;
        }

        const csrfToken = document.querySelector('form[action="/add-invitation-code"] input[name="_csrf"]').value;

        try {
            const response = await fetch('/add-invitation-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    'invitation-code-1': codeList[0].value,
                    'invitation-code-2': codeList[1].value,
                    'invitation-code-3': codeList[2].value,
                    'invitation-code-4': codeList[3].value,
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                showMessage(responseData.message, 'success');
                clearCode();

                location.reload();
            } else {
                showMessage(responseData.error, 'error');
            }
        } catch (error) {
            showMessage(error, 'error');
        }
    });

    const delCodeFormList = document.querySelectorAll('form[action^="delete-code/"]');
    const delCodeMessage = document.getElementById('delete-code-message');
    delCodeFormList.forEach(form => {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const action = form.getAttribute('action');
            const codeId = action.split('/').pop();
            const csrfToken = document.querySelector('form[action^="delete-code/"] input[name="_csrf"]').value;
            try {
                const response = await fetch(action, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken,
                    }
                });

                const responseData = await response.json();
                if (response.ok) {
                    showToastNotification(responseData.message, 'success');

                    location.reload();
                } else {
                    showToastNotification(responseData.error, 'error');
                }
            } catch (error) {
                showToastNotification(error, 'error');
            }
        });
    });

    toastNotificationClose.addEventListener('click', hideNotification);


    /*************************** HELPER FUNCTIONS ***************************/
    // Generate an N digit invitation code
    function generateCode(n) {
        let number = '';
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(Math.random() * 10);
            number += digit.toString();
        }
        return number;
    }

    // Show overlay
    function openOverlay() {
        overlay.style.display = 'block';
        sessionStorage.setItem('codeOverlay', 'show')
    }

    // Hide overlay
    function closeOverlay() {
        overlay.style.display = 'none';
        sessionStorage.setItem('codeOverlay', 'hide')
    }

    // Fill in the invitation code
    function fillInCode() {
        hideMessage();
        const number = generateCode(codeList.length);
        codeList.forEach((code, index) => {
            code.value = number[index];
        })
    }

    // Clear the invitation code
    function clearCode() {
        codeList.forEach((code, index) => {
            code.value = '';
        })
    }

    function showToastNotification(content, style) {
        toastNotification.style.display = 'block';
        toastNotification.classList.add(style);
        toastNotificationMessage.textContent = content;


        sessionStorage.setItem('toast-notification-history', JSON.stringify({
            display: 'show',
            style: style,
            content: content,
        }));

        setTimeout(() => hideNotification(), 5000);
    }

    function hideNotification() {
        toastNotification.style.display = 'none';
        toastNotification.classList.remove('success', 'notification', 'warning', 'error');

        sessionStorage.setItem('toast-notification-history', JSON.stringify({
            display: 'hide',
            style: '',
            content: '',
        }));
    }

    function hasEmptyfields(nodeList) {
        return Array.from(nodeList).some(ele => ele.value.length === 0);
    }

    function showMessage(content, style) {
        codeMessage.textContent = content;
        codeMessage.classList.add(style);
        codeMessage.style.display = 'block';

        sessionStorage.setItem('message-history', JSON.stringify({
            display: 'show',
            style: style,
            content: content,
        }));

    }

    function hideMessage() {
        codeMessage.textContent = '';
        codeMessage.classList.remove('success', 'notification', 'warning', 'error');
        codeMessage.style.display = 'none';

        sessionStorage.setItem('message-history', JSON.stringify({
            display: 'hide',
            style: '',
            content: '',
        }));
    }
});
