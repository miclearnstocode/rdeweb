import {$} from "../lib/lib.js";
import {Route, Switch} from "../lib/Router.js";
import {showPasswordResetModal} from "./Code.js";

export const Retrieval = () => {
    // Check if we're in a modal context or page context
    const isModalContext = window.location.pathname === '/account/Login?';
    
    // If we're on the login page, we don't need to render anything
    // The modal will handle everything
    if (isModalContext) {
        // Return empty div - modal handles everything
        return $({
            tag: 'div',
            style: { display: 'none' }
        });
    }
    
    // For backward compatibility or direct access to /accountSupport
    const codeState = (sessionStorage.getItem('code_retrieval') !== undefined);
    
    return $({
        tag: 'div',
        style: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)',
            padding: '20px'
        },
        child: Switch({
            indexPath: '2',
            components: [
                Route('index', {
                    element: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                maxWidth: '500px',
                                margin: '0 auto'
                            },
                            child: [
                                // This will be replaced by the modal approach
                                // But kept for backward compatibility
                                showEmailForm()
                            ]
                        })
                    ]
                }),
                Route('code', {
                    element: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                maxWidth: '500px',
                                margin: '0 auto'
                            },
                            child: [
                                showCodeVerificationForm()
                            ]
                        })
                    ],
                    auth: codeState
                }),
                Route('pass', {
                    element: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                maxWidth: '500px',
                                margin: '0 auto'
                            },
                            child: [
                                showPasswordResetForm()
                            ]
                        })
                    ],
                    auth: sessionStorage.getItem('passGrant') !== undefined
                })
            ]
        })
    });
};

// Helper function for email form (backward compatibility)
const showEmailForm = () => {
    let email = '';
    
    const submitEmail = async () => {
        if (!email) {
            showErrorModal('Please enter your email address');
            return;
        }
        
        let loading = createLoadingOverlay();
        document.body.appendChild(loading);
        
        const form = new FormData();
        form.append('codeRequest', '1');
        form.append('userEmail', email);
        
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
                    showSuccessModal('Code sent successfully!', () => {
                        window.location.replace('/accountSupport/code');
                    });
                } else {
                    showErrorModal(data.message || 'Email not found');
                }
            } else {
                showErrorModal('Server error. Please try again.');
            }
        } catch (error) {
            loading.remove();
            showErrorModal('Network error. Please try again.');
        }
    };
    
    return $({
        tag: 'div',
        style: {
            background: 'linear-gradient(145deg, rgba(25, 35, 55, 0.95), rgba(15, 25, 45, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 25px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 150, 255, 0.1)'
        },
        child: [
            $({
                tag: 'a',
                text: '← Back to Login',
                style: {
                    display: 'inline-block',
                    marginBottom: '1.5rem',
                    color: '#00aaff',
                    textDecoration: 'none',
                    fontFamily: 'Segoe UI, sans-serif',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                },
                att: { href: '/account/Login?' }
            }),
            $({
                tag: 'h2',
                text: 'Reset Your Password',
                style: {
                    color: '#00aaff',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontFamily: 'Segoe UI, sans-serif'
                }
            }),
            $({
                tag: 'p',
                text: 'Enter your email address to receive a verification code.',
                style: {
                    color: '#88aaff',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontFamily: 'Segoe UI, sans-serif'
                }
            }),
            $({
                tag: 'input',
                att: {
                    type: 'email',
                    placeholder: 'Enter your CAPSU email',
                    required: true
                },
                style: {
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(10, 20, 40, 0.8)',
                    border: '2px solid rgba(0, 150, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    marginBottom: '1rem',
                    boxSizing: 'border-box'
                },
                event: {
                    type: 'input',
                    method: (e) => { email = e.target.value; }
                }
            }),
            $({
                tag: 'button',
                text: 'Send Verification Code',
                style: {
                    width: '100%',
                    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    color: '#fff'
                },
                event: {
                    type: 'click',
                    method: submitEmail
                }
            })
        ]
    });
};

// Helper function for code verification form (backward compatibility)
const showCodeVerificationForm = () => {
    let code = '';
    const email = sessionStorage.getItem('code_retrieval');
    
    const verifyCode = async () => {
        if (!code || code.length !== 6) {
            showErrorModal('Please enter a valid 6-digit code');
            return;
        }
        
        let loading = createLoadingOverlay();
        document.body.appendChild(loading);
        
        const form = new FormData();
        form.append('codeSession', '1');
        form.append('securityCode', code);
        
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
                    window.location.replace('/accountSupport/code/pass');
                } else {
                    showErrorModal(data.message || 'Invalid code');
                }
            } else {
                showErrorModal('Server error. Please try again.');
            }
        } catch (error) {
            loading.remove();
            showErrorModal('Network error. Please try again.');
        }
    };
    
    return $({
        tag: 'div',
        style: {
            background: 'linear-gradient(145deg, rgba(25, 35, 55, 0.95), rgba(15, 25, 45, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 25px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 150, 255, 0.1)'
        },
        child: [
            $({
                tag: 'a',
                text: '← Back',
                style: {
                    display: 'inline-block',
                    marginBottom: '1.5rem',
                    color: '#00aaff',
                    textDecoration: 'none',
                    fontFamily: 'Segoe UI, sans-serif',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                },
                event: {
                    type: 'click',
                    method: () => {
                        sessionStorage.removeItem('code_retrieval');
                        window.location.replace('/accountSupport');
                    }
                }
            }),
            $({
                tag: 'h2',
                text: 'Verify Your Account',
                style: {
                    color: '#00aaff',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontFamily: 'Segoe UI, sans-serif'
                }
            }),
            $({
                tag: 'p',
                att: {
                    innerHTML: `A verification code has been sent to <strong>${email}</strong>`
                },
                style: {
                    color: '#88aaff',
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    fontFamily: 'Segoe UI, sans-serif'
                }
            }),
            $({
                tag: 'p',
                text: 'Please enter the 6-digit code below.',
                style: {
                    color: '#88aaff',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontFamily: 'Segoe UI, sans-serif'
                }
            }),
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                },
                child: Array(6).fill().map((_, i) => 
                    $({
                        tag: 'input',
                        att: {
                            type: 'text',
                            maxlength: '1',
                            id: `digit-${i}`
                        },
                        style: {
                            width: '50px',
                            height: '60px',
                            textAlign: 'center',
                            fontSize: '24px',
                            fontWeight: '600',
                            backgroundColor: 'rgba(10, 20, 40, 0.8)',
                            border: '2px solid rgba(0, 150, 255, 0.2)',
                            borderRadius: '12px',
                            color: '#00aaff',
                            outline: 'none'
                        },
                        event: {
                            type: 'input',
                            method: (e) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                // Update code variable
                                let fullCode = '';
                                for (let j = 0; j < 6; j++) {
                                    const input = document.getElementById(`digit-${j}`);
                                    if (input) fullCode += input.value;
                                }
                                code = fullCode;
                                
                                // Auto-focus next
                                if (e.target.value && i < 5) {
                                    const next = document.getElementById(`digit-${i + 1}`);
                                    if (next) next.focus();
                                }
                                
                                // Auto-submit if all filled
                                if (fullCode.length === 6) {
                                    setTimeout(verifyCode, 100);
                                }
                            },
                            type2: 'keydown',
                            method2: (e) => {
                                if (e.key === 'Backspace' && !e.target.value && i > 0) {
                                    const prev = document.getElementById(`digit-${i - 1}`);
                                    if (prev) {
                                        prev.focus();
                                        prev.value = '';
                                    }
                                }
                            }
                        }
                    })
                )
            }),
            $({
                tag: 'button',
                text: 'Verify Code',
                style: {
                    width: '100%',
                    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    color: '#fff',
                    marginTop: '1rem'
                },
                event: {
                    type: 'click',
                    method: verifyCode
                }
            })
        ]
    });
};

// Helper function for password reset form (backward compatibility)
const showPasswordResetForm = () => {
    let password = '';
    let confirmPassword = '';
    const username = sessionStorage.getItem('userName');
    
    const updatePassword = async () => {
        if (!password || password.length < 8) {
            showErrorModal('Password must be at least 8 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            showErrorModal('Passwords do not match');
            return;
        }
        
        let loading = createLoadingOverlay();
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
                showSuccessModal('Password changed successfully!', () => {
                    window.location.replace('/account/Login?');
                });
            } else {
                showErrorModal(data.message || 'Failed to change password');
            }
        } catch (error) {
            loading.remove();
            showErrorModal('Network error. Please try again.');
        }
    };
    
    return $({
        tag: 'div',
        style: {
            background: 'linear-gradient(145deg, rgba(25, 35, 55, 0.95), rgba(15, 25, 45, 0.95))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 25px 45px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 150, 255, 0.1)'
        },
        child: [
            $({
                tag: 'h2',
                text: 'Create New Password',
                style: {
                    color: '#00aaff',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontFamily: 'Segoe UI, sans-serif'
                }
            }),
            $({
                tag: 'p',
                att: {
                    innerHTML: `Account: <strong>${username}</strong>`
                },
                style: {
                    textAlign: 'center',
                    color: '#88aaff',
                    marginBottom: '2rem',
                    padding: '8px',
                    backgroundColor: 'rgba(0, 100, 255, 0.1)',
                    borderRadius: '8px'
                }
            }),
            $({
                tag: 'label',
                text: 'New Password',
                style: {
                    display: 'block',
                    color: '#88aaff',
                    marginBottom: '0.5rem'
                }
            }),
            $({
                tag: 'input',
                att: {
                    type: 'password',
                    placeholder: 'Enter new password'
                },
                style: {
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(10, 20, 40, 0.8)',
                    border: '2px solid rgba(0, 150, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    marginBottom: '1rem',
                    boxSizing: 'border-box'
                },
                event: {
                    type: 'input',
                    method: (e) => { password = e.target.value; }
                }
            }),
            $({
                tag: 'label',
                text: 'Confirm Password',
                style: {
                    display: 'block',
                    color: '#88aaff',
                    marginBottom: '0.5rem'
                }
            }),
            $({
                tag: 'input',
                att: {
                    type: 'password',
                    placeholder: 'Confirm your password'
                },
                style: {
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(10, 20, 40, 0.8)',
                    border: '2px solid rgba(0, 150, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    marginBottom: '1rem',
                    boxSizing: 'border-box'
                },
                event: {
                    type: 'input',
                    method: (e) => { confirmPassword = e.target.value; }
                }
            }),
            $({
                tag: 'p',
                text: '*Minimum length of 8 characters',
                style: {
                    color: '#6688aa',
                    fontSize: '0.75rem',
                    marginBottom: '1rem'
                }
            }),
            $({
                tag: 'button',
                text: 'Update Password',
                style: {
                    width: '100%',
                    background: 'linear-gradient(135deg, #0066ff, #00aaff)',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    color: '#fff'
                },
                event: {
                    type: 'click',
                    method: updatePassword
                }
            })
        ]
    });
};

// Helper functions for modals
const showErrorModal = (message) => {
    const modalContent = document.createElement('div');
    modalContent.innerHTML = `<p style="color: #88aaff; text-align: center;">${message}</p>`;
    
    CustomModal({
        title: 'Error',
        content: modalContent,
        size: 'small'
    });
};

const showSuccessModal = (message, onConfirm) => {
    const modalContent = document.createElement('div');
    modalContent.innerHTML = `<p style="color: #88aaff; text-align: center;">${message}</p>`;
    
    CustomModal({
        title: 'Success',
        content: modalContent,
        size: 'small',
        footer: ({ closeModal }) => {
            const button = document.createElement('button');
            button.textContent = 'Continue';
            button.style.background = 'linear-gradient(135deg, #0066ff, #00aaff)';
            button.style.border = 'none';
            button.style.padding = '10px 24px';
            button.style.fontSize = '0.9rem';
            button.style.fontWeight = '600';
            button.style.borderRadius = '40px';
            button.style.cursor = 'pointer';
            button.style.color = '#fff';
            button.onclick = () => {
                closeModal();
                if (onConfirm) onConfirm();
            };
            return button;
        }
    });
};

const createLoadingOverlay = () => {
    const loading = document.createElement('div');
    loading.style.position = 'fixed';
    loading.style.top = '0';
    loading.style.left = '0';
    loading.style.width = '100%';
    loading.style.height = '100%';
    loading.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loading.style.display = 'flex';
    loading.style.alignItems = 'center';
    loading.style.justifyContent = 'center';
    loading.style.zIndex = '99999';
    
    const spinner = document.createElement('div');
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.border = '5px solid rgba(0, 150, 255, 0.3)';
    spinner.style.borderTopColor = '#00aaff';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';
    
    loading.appendChild(spinner);
    return loading;
};