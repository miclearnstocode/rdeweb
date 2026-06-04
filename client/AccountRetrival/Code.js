import {$, Request, SpecialChar, Waiting, CustomModal} from "../lib/lib.js";

export const showPasswordResetModal = () => {
    let email = '';
    let verificationCode = '';
    let newPassword = '';
    let confirmPassword = '';
    let currentStep = 'email';
    let currentModal = null;
    let modalContentArea = null;
    let modalOverlayElement = null;
    
    // Function to send reset code
    const sendResetCode = async (emailValue, closeModal) => {
        if (!emailValue || emailValue === '') {
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Please enter your email address.</p>';
            CustomModal({
                title: 'Email Required',
                content: errorContent,
                size: 'small'
            });
            return;
        }
        
        let loading = Waiting();
        document.body.appendChild(loading);
        
        const form = new FormData();
        form.append('codeRequest', '1');
        form.append('userEmail', emailValue);
        
        try {
            const res = await fetch('/accountRetrieval', {
                method: 'POST',
                body: form
            });
            
            loading.remove();
            
            if (res.ok) {
                const data = await res.json();
                if (data.status) {
                    sessionStorage.setItem('code_retrieval', data.email);
                    sessionStorage.setItem('reset_email', data.email);
                    currentStep = 'code';
                    updateModalContent(createCodeContent());
                } else {
                    const errorContent = document.createElement('div');
                    errorContent.innerHTML = `<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">${data.message || 'Email not found. Please try again.'}</p>`;
                    CustomModal({
                        title: 'Error',
                        content: errorContent,
                        size: 'small'
                    });
                }
            } else {
                const errorContent = document.createElement('div');
                errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Server error. Please try again later.</p>';
                CustomModal({
                    title: 'Error',
                    content: errorContent,
                    size: 'small'
                });
            }
        } catch (error) {
            loading.remove();
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">An error occurred. Please try again.</p>';
            CustomModal({
                title: 'Error',
                content: errorContent,
                size: 'small'
            });
        }
    };
    
    // Function to verify code
    const verifyCode = async (codeValue, closeModal) => {
        if (!codeValue || codeValue.length !== 6) {
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Please enter a valid 6-digit code.</p>';
            CustomModal({
                title: 'Invalid Code',
                content: errorContent,
                size: 'small'
            });
            return;
        }
        
        let loading = Waiting();
        document.body.appendChild(loading);
        
        const form = new FormData();
        form.append('codeSession', '1');
        form.append('securityCode', codeValue);
        
        try {
            const res = await fetch('/sessionStorage', {
                method: 'POST',
                body: form
            });
            
            loading.remove();
            
            if (res.ok) {
                const data = await res.json();
                if (data.status) {
                    sessionStorage.setItem('passGrant', '1');
                    sessionStorage.setItem('userName', data.userName);
                    currentStep = 'password';
                    updateModalContent(createPasswordContent());
                } else {
                    const errorContent = document.createElement('div');
                    errorContent.innerHTML = `<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">${data.message || 'Invalid verification code'}</p>`;
                    CustomModal({
                        title: 'Verification Failed',
                        content: errorContent,
                        size: 'small'
                    });
                }
            }
        } catch (error) {
            loading.remove();
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Network error. Please try again.</p>';
            CustomModal({
                title: 'Error',
                content: errorContent,
                size: 'small'
            });
        }
    };
    
    // Function to update password
    const updatePassword = async (password, confirmPassword, closeModal) => {
        if (!password || password.length < 8) {
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Password must be at least 8 characters long!</p>';
            CustomModal({
                title: 'Invalid Password',
                content: errorContent,
                size: 'small'
            });
            return;
        }
        
        if (password !== confirmPassword) {
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Passwords do not match!</p>';
            CustomModal({
                title: 'Password Mismatch',
                content: errorContent,
                size: 'small'
            });
            return;
        }
        
        let loading = Waiting();
        document.body.appendChild(loading);
        
        const req = new Request('/accountRetrieval');
        req.Post([
            { name: 'changePass', value: '1' },
            { name: 'password', value: password }
        ]);
        req.Json();
        
        try {
            const data = await req.Send();
            loading.remove();
            
            if (data.status) {
                sessionStorage.removeItem('code_retrieval');
                sessionStorage.removeItem('passGrant');
                sessionStorage.removeItem('userName');
                sessionStorage.removeItem('reset_email');
                
                const successContent = document.createElement('div');
                successContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">Your password has been changed successfully. Please login with your new password.</p>';
                
                CustomModal({
                    title: 'Success!',
                    content: successContent,
                    size: 'small',
                    footer: ({ closeModal: closeSuccessModal }) => {
                        const button = document.createElement('button');
                        button.textContent = 'Go to Login';
                        button.style.background = 'linear-gradient(135deg, #0066ff, #00aaff)';
                        button.style.border = 'none';
                        button.style.padding = '10px 24px';
                        button.style.fontSize = '0.9rem';
                        button.style.fontWeight = '600';
                        button.style.borderRadius = '40px';
                        button.style.cursor = 'pointer';
                        button.style.color = '#fff';
                        button.onclick = () => {
                            closeSuccessModal();
                            if (closeModal) closeModal();
                            window.location.reload();
                        };
                        return button;
                    }
                });
            } else {
                const errorContent = document.createElement('div');
                errorContent.innerHTML = `<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">${data.message || 'Failed to change password'}</p>`;
                CustomModal({
                    title: 'Error',
                    content: errorContent,
                    size: 'small'
                });
            }
        } catch (error) {
            loading.remove();
            const errorContent = document.createElement('div');
            errorContent.innerHTML = '<p style="color: #88aaff; font-family: Segoe UI, sans-serif; text-align: center;">An error occurred. Please try again.</p>';
            CustomModal({
                title: 'Error',
                content: errorContent,
                size: 'small'
            });
        }
    };
    
    // Function to update modal content
    const updateModalContent = (newContent) => {
        if (modalContentArea) {
            modalContentArea.innerHTML = '';
            modalContentArea.appendChild(newContent);
        }
        // Update button text
        updateActionButton();
    };
    
    // Function to update action button text
    const updateActionButton = () => {
        const actionBtn = document.getElementById('password-reset-action-btn');
        if (actionBtn) {
            if (currentStep === 'email') {
                actionBtn.textContent = 'Send Code';
            } else if (currentStep === 'code') {
                actionBtn.textContent = 'Verify Code';
            } else if (currentStep === 'password') {
                actionBtn.textContent = 'Update Password';
            }
        }
    };
    
    // Create email input content
    const createEmailContent = () => {
        const container = document.createElement('div');
        container.style.padding = '0.5rem 0';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Enter your email address to receive a password reset code.';
        paragraph.style.color = '#88aaff';
        paragraph.style.fontSize = '0.9rem';
        paragraph.style.marginBottom = '1.5rem';
        paragraph.style.textAlign = 'center';
        paragraph.style.fontFamily = 'Segoe UI, sans-serif';
        container.appendChild(paragraph);
        
        const input = document.createElement('input');
        input.type = 'email';
        input.id = 'reset-email-input';
        input.placeholder = 'Enter your CAPSU email';
        input.required = true;
        input.style.width = '100%';
        input.style.padding = '12px 16px';
        input.style.backgroundColor = 'rgba(10, 20, 40, 0.8)';
        input.style.border = '2px solid rgba(0, 150, 255, 0.2)';
        input.style.borderRadius = '12px';
        input.style.color = '#fff';
        input.style.fontSize = '0.95rem';
        input.style.outline = 'none';
        input.style.transition = 'all 0.3s ease';
        input.style.boxSizing = 'border-box';
        
        input.addEventListener('focus', (e) => {
            e.target.style.borderColor = '#00aaff';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 150, 255, 0.2)';
        });
        
        input.addEventListener('blur', (e) => {
            e.target.style.borderColor = 'rgba(0, 150, 255, 0.2)';
            e.target.style.boxShadow = 'none';
        });
        
        input.addEventListener('input', (e) => {
            email = e.target.value;
        });
        
        container.appendChild(input);
        return container;
    };
    
    // Create code verification content with separate boxes
    const createCodeContent = () => {
        const container = document.createElement('div');
        container.style.padding = '0.5rem 0';
        
        const infoText = document.createElement('div');
        infoText.innerHTML = `A verification code has been sent to <strong style="color: #00aaff">${sessionStorage.getItem('reset_email') || sessionStorage.getItem('code_retrieval')}</strong>`;
        infoText.style.color = '#88aaff';
        infoText.style.fontSize = '0.9rem';
        infoText.style.marginBottom = '1rem';
        infoText.style.textAlign = 'center';
        container.appendChild(infoText);
        
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Please enter the 6-digit verification code below.';
        paragraph.style.color = '#88aaff';
        paragraph.style.fontSize = '0.9rem';
        paragraph.style.marginBottom = '1.5rem';
        paragraph.style.textAlign = 'center';
        container.appendChild(paragraph);
        
        const codeContainer = document.createElement('div');
        codeContainer.style.display = 'flex';
        codeContainer.style.gap = '12px';
        codeContainer.style.justifyContent = 'center';
        codeContainer.style.marginBottom = '1rem';
        
        const inputs = [];
        const codeValues = ['', '', '', '', '', ''];
        
        for (let i = 0; i < 6; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `code-digit-${i}`;
            input.maxLength = 1;
            input.inputMode = 'numeric';
            input.style.width = '50px';
            input.style.height = '60px';
            input.style.textAlign = 'center';
            input.style.fontSize = '24px';
            input.style.fontWeight = '600';
            input.style.backgroundColor = 'rgba(10, 20, 40, 0.8)';
            input.style.border = '2px solid rgba(0, 150, 255, 0.2)';
            input.style.borderRadius = '12px';
            input.style.color = '#00aaff';
            input.style.outline = 'none';
            input.style.transition = 'all 0.3s ease';
            input.style.fontFamily = 'monospace';
            
            input.addEventListener('focus', (e) => {
                e.target.style.borderColor = '#00aaff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 150, 255, 0.2)';
                e.target.style.transform = 'scale(1.05)';
            });
            
            input.addEventListener('blur', (e) => {
                e.target.style.borderColor = 'rgba(0, 150, 255, 0.2)';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'scale(1)';
            });
            
            input.addEventListener('input', (e) => {
                let value = e.target.value;
                value = value.replace(/[^0-9]/g, '');
                e.target.value = value;
                codeValues[i] = value;
                verificationCode = codeValues.join('');
                
                if (value && i < 5) {
                    inputs[i + 1].focus();
                }
                
                if (codeValues.every(v => v !== '')) {
                    setTimeout(() => {
                        const actionBtn = document.getElementById('password-reset-action-btn');
                        if (actionBtn && actionBtn.textContent === 'Verify Code') {
                            actionBtn.click();
                        }
                    }, 100);
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !codeValues[i] && i > 0) {
                    inputs[i - 1].focus();
                    inputs[i - 1].value = '';
                    codeValues[i - 1] = '';
                    verificationCode = codeValues.join('');
                }
            });
            
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const numbers = pastedData.replace(/[^0-9]/g, '').split('').slice(0, 6);
                
                numbers.forEach((num, idx) => {
                    if (idx < 6) {
                        codeValues[idx] = num;
                        if (inputs[idx]) {
                            inputs[idx].value = num;
                        }
                    }
                });
                
                verificationCode = codeValues.join('');
                
                const nextEmptyIndex = codeValues.findIndex(v => v === '');
                if (nextEmptyIndex !== -1) {
                    inputs[nextEmptyIndex].focus();
                } else {
                    inputs[5].focus();
                    setTimeout(() => {
                        const actionBtn = document.getElementById('password-reset-action-btn');
                        if (actionBtn && actionBtn.textContent === 'Verify Code') {
                            actionBtn.click();
                        }
                    }, 100);
                }
            });
            
            codeContainer.appendChild(input);
            inputs.push(input);
        }
        
        container.appendChild(codeContainer);
        
        const helperText = document.createElement('p');
        helperText.textContent = 'Enter the 6-digit code sent to your email';
        helperText.style.color = '#6688aa';
        helperText.style.fontSize = '0.75rem';
        helperText.style.textAlign = 'center';
        helperText.style.marginTop = '0.5rem';
        container.appendChild(helperText);
        
        const resendContainer = document.createElement('div');
        resendContainer.style.textAlign = 'center';
        resendContainer.style.marginTop = '1rem';
        const resendLink = document.createElement('a');
        resendLink.textContent = "Didn't receive the code? Resend";
        resendLink.style.color = '#00aaff';
        resendLink.style.textDecoration = 'none';
        resendLink.style.fontSize = '0.8rem';
        resendLink.style.cursor = 'pointer';
        resendLink.onclick = async () => {
            const savedEmail = sessionStorage.getItem('reset_email') || sessionStorage.getItem('code_retrieval');
            if (savedEmail) {
                for (let i = 0; i < 6; i++) {
                    if (inputs[i]) {
                        inputs[i].value = '';
                        codeValues[i] = '';
                    }
                }
                verificationCode = '';
                
                let loading = Waiting();
                document.body.appendChild(loading);
                
                const form = new FormData();
                form.append('codeRequest', '1');
                form.append('userEmail', savedEmail);
                
                const res = await fetch('/accountRetrieval', {
                    method: 'POST',
                    body: form
                });
                
                loading.remove();
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.status) {
                        const successContent = document.createElement('div');
                        successContent.innerHTML = '<p style="color: #88aaff; text-align: center;">A new code has been sent to your email.</p>';
                        CustomModal({
                            title: 'Code Resent',
                            content: successContent,
                            size: 'small'
                        });
                    }
                }
            }
        };
        resendContainer.appendChild(resendLink);
        container.appendChild(resendContainer);
        
        return container;
    };
    

    const createPasswordContent = () => {
        const container = document.createElement('div');
        container.style.padding = '0.5rem 0';
        
        const usernameDisplay = document.createElement('div');
        usernameDisplay.innerHTML = `Account: <strong style="color: #00aaff">${sessionStorage.getItem('userName')}</strong>`;
        usernameDisplay.style.color = '#88aaff';
        usernameDisplay.style.fontSize = '0.9rem';
        usernameDisplay.style.marginBottom = '1.5rem';
        usernameDisplay.style.textAlign = 'center';
        usernameDisplay.style.padding = '8px';
        usernameDisplay.style.backgroundColor = 'rgba(0, 100, 255, 0.1)';
        usernameDisplay.style.borderRadius = '8px';
        container.appendChild(usernameDisplay);
        
        const requirements = document.createElement('div');
        requirements.style.textAlign = 'center';
        requirements.style.marginBottom = '1.5rem';
        requirements.innerHTML = `
            <div style="color: #88aaff; font-size: 0.9rem; margin-bottom: 0.25rem;">Create new password</div>
            <i style="font-size: 0.75rem; color: #6688aa;">*Minimum length of 8 characters</i>
        `;
        container.appendChild(requirements);
        
        // New Password field with eye icon
        const newPasswordLabel = document.createElement('label');
        newPasswordLabel.textContent = 'New Password';
        newPasswordLabel.style.display = 'block';
        newPasswordLabel.style.color = '#88aaff';
        newPasswordLabel.style.fontSize = '0.85rem';
        newPasswordLabel.style.fontWeight = '500';
        newPasswordLabel.style.marginBottom = '0.5rem';
        container.appendChild(newPasswordLabel);
        
        const newPasswordWrapper = document.createElement('div');
        newPasswordWrapper.style.position = 'relative';
        newPasswordWrapper.style.width = '100%';
        newPasswordWrapper.style.marginBottom = '1rem';
        
        const newPasswordInput = document.createElement('input');
        newPasswordInput.type = 'password';
        newPasswordInput.id = 'new-password-input';
        newPasswordInput.placeholder = 'Enter new password';
        newPasswordInput.style.width = '100%';
        newPasswordInput.style.padding = '12px 45px 12px 16px';
        newPasswordInput.style.backgroundColor = 'rgba(10, 20, 40, 0.8)';
        newPasswordInput.style.border = '2px solid rgba(0, 150, 255, 0.2)';
        newPasswordInput.style.borderRadius = '12px';
        newPasswordInput.style.color = '#fff';
        newPasswordInput.style.fontSize = '0.95rem';
        newPasswordInput.style.outline = 'none';
        newPasswordInput.style.boxSizing = 'border-box';
        newPasswordInput.style.transition = 'all 0.3s ease';
        
        newPasswordInput.addEventListener('focus', (e) => {
            e.target.style.borderColor = '#00aaff';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 150, 255, 0.2)';
        });
        
        newPasswordInput.addEventListener('blur', (e) => {
            e.target.style.borderColor = 'rgba(0, 150, 255, 0.2)';
            e.target.style.boxShadow = 'none';
        });
        
        newPasswordInput.addEventListener('input', (e) => {
            newPassword = e.target.value;
        });
        
        const newPasswordToggle = document.createElement('span');
        newPasswordToggle.style.position = 'absolute';
        newPasswordToggle.style.right = '12px';
        newPasswordToggle.style.top = '50%';
        newPasswordToggle.style.transform = 'translateY(-50%)';
        newPasswordToggle.style.cursor = 'pointer';
        newPasswordToggle.style.color = '#6688aa';
        newPasswordToggle.style.zIndex = '10';
        newPasswordToggle.style.display = 'flex';
        newPasswordToggle.style.alignItems = 'center';
        newPasswordToggle.style.justifyContent = 'center';
        newPasswordToggle.style.width = '32px';
        newPasswordToggle.style.height = '32px';
        newPasswordToggle.style.borderRadius = '50%';
        newPasswordToggle.style.transition = 'all 0.3s ease';
        newPasswordToggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
        
        let newPasswordVisible = false;
        newPasswordToggle.addEventListener('click', () => {
            newPasswordVisible = !newPasswordVisible;
            newPasswordInput.type = newPasswordVisible ? 'text' : 'password';
            newPasswordToggle.innerHTML = newPasswordVisible ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            newPasswordToggle.style.color = newPasswordVisible ? '#00aaff' : '#6688aa';
        });
        
        newPasswordToggle.addEventListener('mouseenter', () => {
            newPasswordToggle.style.color = '#00aaff';
            newPasswordToggle.style.backgroundColor = 'rgba(0, 150, 255, 0.15)';
        });
        
        newPasswordToggle.addEventListener('mouseleave', () => {
            newPasswordToggle.style.color = newPasswordVisible ? '#00aaff' : '#6688aa';
            newPasswordToggle.style.backgroundColor = 'transparent';
        });
        
        newPasswordWrapper.appendChild(newPasswordInput);
        newPasswordWrapper.appendChild(newPasswordToggle);
        container.appendChild(newPasswordWrapper);
        
        // Confirm Password field with eye icon
        const confirmPasswordLabel = document.createElement('label');
        confirmPasswordLabel.textContent = 'Confirm Password';
        confirmPasswordLabel.style.display = 'block';
        confirmPasswordLabel.style.color = '#88aaff';
        confirmPasswordLabel.style.fontSize = '0.85rem';
        confirmPasswordLabel.style.fontWeight = '500';
        confirmPasswordLabel.style.marginBottom = '0.5rem';
        container.appendChild(confirmPasswordLabel);
        
        const confirmPasswordWrapper = document.createElement('div');
        confirmPasswordWrapper.style.position = 'relative';
        confirmPasswordWrapper.style.width = '100%';
        confirmPasswordWrapper.style.marginBottom = '1rem';
        
        const confirmPasswordInput = document.createElement('input');
        confirmPasswordInput.type = 'password';
        confirmPasswordInput.id = 'confirm-password-input';
        confirmPasswordInput.placeholder = 'Confirm your password';
        confirmPasswordInput.style.width = '100%';
        confirmPasswordInput.style.padding = '12px 45px 12px 16px';
        confirmPasswordInput.style.backgroundColor = 'rgba(10, 20, 40, 0.8)';
        confirmPasswordInput.style.border = '2px solid rgba(0, 150, 255, 0.2)';
        confirmPasswordInput.style.borderRadius = '12px';
        confirmPasswordInput.style.color = '#fff';
        confirmPasswordInput.style.fontSize = '0.95rem';
        confirmPasswordInput.style.outline = 'none';
        confirmPasswordInput.style.boxSizing = 'border-box';
        confirmPasswordInput.style.transition = 'all 0.3s ease';
        
        confirmPasswordInput.addEventListener('focus', (e) => {
            e.target.style.borderColor = '#00aaff';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 150, 255, 0.2)';
        });
        
        confirmPasswordInput.addEventListener('blur', (e) => {
            e.target.style.borderColor = 'rgba(0, 150, 255, 0.2)';
            e.target.style.boxShadow = 'none';
        });
        
        confirmPasswordInput.addEventListener('input', (e) => {
            confirmPassword = e.target.value;
        });
        
        const confirmPasswordToggle = document.createElement('span');
        confirmPasswordToggle.style.position = 'absolute';
        confirmPasswordToggle.style.right = '12px';
        confirmPasswordToggle.style.top = '50%';
        confirmPasswordToggle.style.transform = 'translateY(-50%)';
        confirmPasswordToggle.style.cursor = 'pointer';
        confirmPasswordToggle.style.color = '#6688aa';
        confirmPasswordToggle.style.zIndex = '10';
        confirmPasswordToggle.style.display = 'flex';
        confirmPasswordToggle.style.alignItems = 'center';
        confirmPasswordToggle.style.justifyContent = 'center';
        confirmPasswordToggle.style.width = '32px';
        confirmPasswordToggle.style.height = '32px';
        confirmPasswordToggle.style.borderRadius = '50%';
        confirmPasswordToggle.style.transition = 'all 0.3s ease';
        confirmPasswordToggle.innerHTML = '<i class="fa-solid fa-eye"></i>';
        
        let confirmPasswordVisible = false;
        confirmPasswordToggle.addEventListener('click', () => {
            confirmPasswordVisible = !confirmPasswordVisible;
            confirmPasswordInput.type = confirmPasswordVisible ? 'text' : 'password';
            confirmPasswordToggle.innerHTML = confirmPasswordVisible ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            confirmPasswordToggle.style.color = confirmPasswordVisible ? '#00aaff' : '#6688aa';
        });
        
        confirmPasswordToggle.addEventListener('mouseenter', () => {
            confirmPasswordToggle.style.color = '#00aaff';
            confirmPasswordToggle.style.backgroundColor = 'rgba(0, 150, 255, 0.15)';
        });
        
        confirmPasswordToggle.addEventListener('mouseleave', () => {
            confirmPasswordToggle.style.color = confirmPasswordVisible ? '#00aaff' : '#6688aa';
            confirmPasswordToggle.style.backgroundColor = 'transparent';
        });
        
        confirmPasswordWrapper.appendChild(confirmPasswordInput);
        confirmPasswordWrapper.appendChild(confirmPasswordToggle);
        container.appendChild(confirmPasswordWrapper);
        
        return container;
    };
    
    // Create the main modal
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'modal-content-area';
    contentWrapper.appendChild(createEmailContent());
    modalContentArea = contentWrapper;
    
    const footer = ({ closeModal }) => {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '12px';
        buttonContainer.style.justifyContent = 'flex-end';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.border = '2px solid rgba(0, 150, 255, 0.3)';
        cancelBtn.style.padding = '10px 24px';
        cancelBtn.style.fontSize = '0.9rem';
        cancelBtn.style.fontWeight = '600';
        cancelBtn.style.borderRadius = '40px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.color = '#88aaff';
        cancelBtn.style.transition = 'all 0.3s ease';
        cancelBtn.onclick = () => {
            closeModal();
            sessionStorage.removeItem('passGrant');
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('reset_email');
            sessionStorage.removeItem('code_retrieval');
        };
        
        const actionBtn = document.createElement('button');
        actionBtn.id = 'password-reset-action-btn';
        actionBtn.textContent = 'Send Code';
        actionBtn.style.background = 'linear-gradient(135deg, #0066ff, #00aaff)';
        actionBtn.style.border = 'none';
        actionBtn.style.padding = '10px 24px';
        actionBtn.style.fontSize = '0.9rem';
        actionBtn.style.fontWeight = '600';
        actionBtn.style.borderRadius = '40px';
        actionBtn.style.cursor = 'pointer';
        actionBtn.style.color = '#fff';
        actionBtn.style.transition = 'all 0.3s ease';
        
        actionBtn.onclick = async () => {
            if (currentStep === 'email') {
                const emailInput = document.getElementById('reset-email-input');
                const emailValue = emailInput ? emailInput.value : email;
                await sendResetCode(emailValue, closeModal);
            } else if (currentStep === 'code') {
                let codeValue = '';
                for (let i = 0; i < 6; i++) {
                    const input = document.getElementById(`code-digit-${i}`);
                    if (input && input.value) {
                        codeValue += input.value;
                    }
                }
                await verifyCode(codeValue, closeModal);
            } else if (currentStep === 'password') {
                const newPassInput = document.getElementById('new-password-input');
                const confirmPassInput = document.getElementById('confirm-password-input');
                await updatePassword(
                    newPassInput ? newPassInput.value : newPassword,
                    confirmPassInput ? confirmPassInput.value : confirmPassword,
                    closeModal
                );
            }
        };
        
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(actionBtn);
        
        return buttonContainer;
    };
    
    currentModal = CustomModal({
        title: 'Reset Password',
        content: contentWrapper,
        size: 'small',
        footer: footer
    });
    
    return currentModal;
};