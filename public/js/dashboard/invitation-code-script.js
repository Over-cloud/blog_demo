document.addEventListener('DOMContentLoaded', function(){
    /*************************** SELECT ELEMENTS ***************************/
    const generateCodeBtn = document.getElementById('generate-invitation-code-btn');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('close-btn');
    const addCodeForm = document.querySelector('form[action="/add-invitation-code"]');
    const outputs = document.querySelectorAll('#invitation-code-outputs input');
    const invitationOutputError = document.getElementById('invitation-outputs-error');

    /*************************** ON PAGE LOAD ***************************/
    if (sessionStorage.getItem('codeOverlay') === 'show') {
        openOverlay();
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
    outputs.forEach((output, index) => {
        output.addEventListener('input', function() {
            // Ensure only digits are entered
            this.value = this.value.replace(/\D/g, '');

            invitationOutputError.style.display = 'none';

            if (this.value.length === 1) {
                let first = index;
                while (first > 0 && outputs[first - 1].value.length === 0) {
                    first--;
                }

                if (first === index) {
                    if (index < outputs.length - 1) {
                        outputs[index + 1].focus();
                    }
                } else {
                    outputs[first].value = this.value;
                    outputs[first + 1].focus();
                    outputs[index].value = '';
                }
            } else if (this.value.length === 0 && index > 0) {
                outputs[index - 1].focus();
            }
        });
    });

    // Check if code is valid
    addCodeForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        let isOutputValid = true;
        outputs.forEach(output => {
            if (output.value.length !== 1) {
                isOutputValid = false;
            }
        });

        if (!isOutputValid) {
            invitationOutputError.textContent = 'Must be a 4-digit code.'
            invitationOutputError.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/add-invitation-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'invitation-code-1': outputs[0].value,
                    'invitation-code-2': outputs[1].value,
                    'invitation-code-3': outputs[2].value,
                    'invitation-code-4': outputs[3].value,
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                invitationOutputError.textContent = responseData.message;
                invitationOutputError.style.display = 'block';
                clearCode();

                location.reload();
            } else {
                invitationOutputError.textContent = responseData.error;
                invitationOutputError.style.display = 'block';
            }
        } catch (error) {
            invitationOutputError.textContent = error;
            invitationOutputError.style.display = 'block';
        }
    });


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
        invitationOutputError.style.display = 'none';
        const number = generateCode(outputs.length);
        outputs.forEach((output, index) => {
            output.value = number[index];
        })
    }

    // Clear the invitation code
    function clearCode() {
        outputs.forEach((output, index) => {
            output.value = '';
        })
    }
});
