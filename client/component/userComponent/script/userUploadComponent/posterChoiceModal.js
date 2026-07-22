import { $, CustomModal } from '../../../../lib/lib.js'
import { PosterViewModel } from './posterViewModal.js'
import { PosterSubmissionModal } from './posterSubmission.js'

export const PosterChoiceModal = ({ onSuccess }) => {
    let modalRef = null

    const buildContent = () => {
        const container = $({
            tag: 'div',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                padding: '8px 0'
            }
        })

        // Header
        const header = $({
            tag: 'div',
            style: {
                textAlign: 'center',
                marginBottom: '8px'
            },
            child: [
                $({
                    tag: 'i',
                    att: { className: 'fas fa-image' },
                    style: { fontSize: '40px', color: '#E91E63', display: 'block', marginBottom: '12px' }
                }),
                $({
                    tag: 'h2',
                    text: 'Poster Management',
                    style: {
                        color: '#1a2a3a',
                        fontSize: '22px',
                        fontWeight: '700',
                        margin: '0 0 4px 0'
                    }
                }),
                $({
                    tag: 'p',
                    text: 'Choose an option below to manage your posters(This is for undergraduate and graduate students only for this event)',
                    style: {
                        color: '#64748b',
                        fontSize: '14px',
                        margin: '0'
                    }
                })
            ]
        })
        container.appendChild(header)

        // Options Grid
        const optionsGrid = $({
            tag: 'div',
            style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginTop: '8px'
            }
        })

        // Submit Poster Option
        const submitOption = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #e8ecf0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
            },
            event: {
                type: 'click',
                method: () => {
                    if (modalRef && modalRef.closeModal) {
                        modalRef.closeModal()
                    }
                    const posterModal = PosterSubmissionModal({
                        onSuccess: () => {
                            if (onSuccess) onSuccess()
                            // Reopen the choice modal after submission
                            setTimeout(() => {
                                const choiceModal = PosterChoiceModal({
                                    onSuccess: onSuccess
                                })
                                document.body.appendChild(choiceModal.element || choiceModal)
                            }, 500)
                        },
                        onClose: () => {}
                    })
                    document.body.appendChild(posterModal.element || posterModal)
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#E91E63'
                    e.currentTarget.style.backgroundColor = '#fce4ec'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(233, 30, 99, 0.12)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0'
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#fce4ec',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-upload' },
                            style: { color: '#E91E63', fontSize: '24px' }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        fontSize: '16px',
                        color: '#1a2a3a',
                        fontWeight: '600'
                    },
                    text: 'Submit Poster'
                }),
                $({
                    tag: 'div',
                    style: {
                        fontSize: '13px',
                        color: '#64748b',
                        lineHeight: '1.4'
                    },
                    text: 'Upload a new poster for your accepted paper'
                })
            ]
        })

        // View Posters Option
        const viewOption = $({
            tag: 'div',
            style: {
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #e8ecf0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
            },
            event: {
                type: 'click',
                method: () => {
                    if (modalRef && modalRef.closeModal) {
                        modalRef.closeModal()
                    }
                    const viewModal = PosterViewModel({
                        onClose: () => {
                            // Reopen the choice modal after viewing
                            setTimeout(() => {
                                const choiceModal = PosterChoiceModal({
                                    onSuccess: onSuccess
                                })
                                document.body.appendChild(choiceModal.element || choiceModal)
                            }, 500)
                        }
                    })
                    document.body.appendChild(viewModal.element || viewModal)
                },
                type2: 'mouseenter',
                method2: (e) => {
                    e.currentTarget.style.borderColor = '#1976D2'
                    e.currentTarget.style.backgroundColor = '#e3f2fd'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(25, 118, 210, 0.12)'
                },
                type3: 'mouseleave',
                method3: (e) => {
                    e.currentTarget.style.borderColor = '#e8ecf0'
                    e.currentTarget.style.backgroundColor = '#f8fafc'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                }
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#e3f2fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    child: [
                        $({
                            tag: 'i',
                            att: { className: 'fas fa-images' },
                            style: { color: '#1976D2', fontSize: '24px' }
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        fontSize: '16px',
                        color: '#1a2a3a',
                        fontWeight: '600'
                    },
                    text: 'View Posters'
                }),
                $({
                    tag: 'div',
                    style: {
                        fontSize: '13px',
                        color: '#64748b',
                        lineHeight: '1.4'
                    },
                    text: 'See all your submitted posters with their status'
                })
            ]
        })

        optionsGrid.appendChild(submitOption)
        optionsGrid.appendChild(viewOption)
        container.appendChild(optionsGrid)

        // Footer note
        const footerNote = $({
            tag: 'div',
            style: {
                textAlign: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #e8ecf0',
                marginTop: '8px'
            },
            child: [
                $({
                    tag: 'span',
                    text: 'Posters are submitted for accepted symposium papers only',
                    style: {
                        color: '#94a3b8',
                        fontSize: '12px'
                    }
                })
            ]
        })
        container.appendChild(footerNote)

        return container
    }

    const buildFooter = ({ closeModal }) => {
        const footerContainer = $({
            tag: 'div',
            style: {
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                width: '100%'
            }
        })
        return footerContainer
    }

    modalRef = CustomModal({
        title: '',
        content: buildContent,
        footer: buildFooter,
        size: 'medium',
        onClose: () => {
            modalRef = null
        },
        closeOnOverlayClick: true,
        showCloseButton: true
    })

    return modalRef
}