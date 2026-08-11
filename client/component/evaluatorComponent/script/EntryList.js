import { $, baseCheck, Request, CustomModal, Toast, ConfirmationModal } from '../../../lib/lib.js'
import { EntryView } from "./entryview.js"


const StatusLabels = ({ hasScore, hasComment, completionStatus }) => {
    // Get completion status label
    const getCompletionLabel = () => {
        switch(completionStatus) {
            case 'completed':
                return { text: 'Presented', color: '#10b981', bg: '#dcfce7', icon: 'fa-solid fa-check-circle' }
            case 'not_presented':
                return { text: 'Not Presented', color: '#ef4444', bg: '#fee2e2', icon: 'fa-solid fa-xmark-circle' }
            case 'pending_confirmation':
            default:
                return { text: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: 'fa-solid fa-clock' }
        }
    }

    const completion = getCompletionLabel()

    // Helper function to create label with hover
    const createLabel = (config) => {
        const label = $({
            tag: 'span',
            style: {
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: config.bg,
                color: config.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: config.border || `1px solid ${config.color}33`,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                cursor: config.clickable ? 'pointer' : 'default',
            },
            child: [
                $({
                    tag: 'span',
                    att: { className: config.icon },
                    style: { fontSize: '11px' }
                }),
                $({
                    tag: 'span',
                    text: config.text
                })
            ]
        });

        // Add hover effect if clickable
        if (config.clickable) {
            const element = label;
            // Store original styles for revert
            const originalBg = config.bg;
            const originalColor = config.color;
            const originalBorder = config.border || `1px solid ${config.color}33`;

            // We need to handle this differently since we're using the $ function
            // We'll add event listeners after element is created
            setTimeout(() => {
                const el = document.querySelector(`[data-label="${config.id}"]`);
                if (el) {
                    el.addEventListener('mouseenter', () => {
                        el.style.backgroundColor = config.hoverBg || originalBg;
                        el.style.borderColor = config.hoverBorder || config.color;
                        el.style.transform = 'translateY(-1px)';
                        el.style.boxShadow = `0 4px 12px ${config.hoverShadow || 'rgba(0,0,0,0.05)'}`;
                    });
                    el.addEventListener('mouseleave', () => {
                        el.style.backgroundColor = originalBg;
                        el.style.borderColor = originalBorder;
                        el.style.transform = 'translateY(0)';
                        el.style.boxShadow = 'none';
                    });
                }
            }, 50);
        }

        return label;
    };

    return $({
        tag: 'div',
        style: {
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            flexShrink: 0,
            flexWrap: 'wrap',
        },
        child: [
            // Completion Status Label
            $({
                tag: 'span',
                att: { 'data-label': 'completion-status' },
                style: {
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    backgroundColor: completion.bg,
                    color: completion.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: `1px solid ${completion.color}33`,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                },
                child: [
                    $({
                        tag: 'span',
                        att: { className: completion.icon },
                        style: { fontSize: '11px' }
                    }),
                    $({
                        tag: 'span',
                        text: completion.text
                    })
                ],
                elementHandler: (el) => {
                    // Add hover effect for Pending status
                    if (completion.text === 'Pending') {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#fef3c7';
                            el.style.borderColor = '#f59e0b';
                            el.style.transform = 'translateY(-1px)';
                            el.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#fef3c7';
                            el.style.borderColor = '#f59e0b33';
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                        });
                    }
                    // Add hover effect for Presented
                    else if (completion.text === 'Presented') {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#dcfce7';
                            el.style.borderColor = '#10b981';
                            el.style.transform = 'translateY(-1px)';
                            el.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#dcfce7';
                            el.style.borderColor = '#10b98133';
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                        });
                    }
                    // Add hover effect for Not Presented
                    else if (completion.text === 'Not Presented') {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#fee2e2';
                            el.style.borderColor = '#ef4444';
                            el.style.transform = 'translateY(-1px)';
                            el.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#fee2e2';
                            el.style.borderColor = '#ef444433';
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                        });
                    }
                }
            }),

            // Comment Status Label - WITH HOVER
            $({
                tag: 'span',
                att: { 'data-label': 'comment-status' },
                style: {
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    backgroundColor: hasComment ? '#dcfce7' : '#f1f5f9',
                    color: hasComment ? '#166534' : '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: hasComment ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    cursor: hasComment ? 'pointer' : 'default',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: hasComment ? 'fa-solid fa-comment' : 'fa-regular fa-comment'
                        },
                        style: { fontSize: '11px' }
                    }),
                    $({
                        tag: 'span',
                        text: hasComment ? 'Commented' : 'No Comments'
                    })
                ],
                elementHandler: (el) => {
                    if (hasComment) {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#bbf7d0';
                            el.style.borderColor = '#22c55e';
                            el.style.transform = 'translateY(-1px)';
                            el.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.2)';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#dcfce7';
                            el.style.borderColor = '#bbf7d0';
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                        });
                    } else {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#e2e8f0';
                            el.style.borderColor = '#94a3b8';
                            el.style.color = '#475569';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#f1f5f9';
                            el.style.borderColor = '#e2e8f0';
                            el.style.color = '#94a3b8';
                        });
                    }
                }
            }),

            // Score Status Label - WITH HOVER
            $({
                tag: 'span',
                att: { 'data-label': 'score-status' },
                style: {
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    backgroundColor: hasScore ? '#ede9fe' : '#f1f5f9',
                    color: hasScore ? '#5b21b6' : '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: hasScore ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    cursor: hasScore ? 'pointer' : 'default',
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: hasScore ? 'fa-solid fa-star' : 'fa-regular fa-star'
                        },
                        style: { fontSize: '11px' }
                    }),
                    $({
                        tag: 'span',
                        text: hasScore ? 'Scored' : 'Not Scored'
                    })
                ],
                elementHandler: (el) => {
                    if (hasScore) {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#c4b5fd';
                            el.style.borderColor = '#8b5cf6';
                            el.style.transform = 'translateY(-1px)';
                            el.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#ede9fe';
                            el.style.borderColor = '#ddd6fe';
                            el.style.transform = 'translateY(0)';
                            el.style.boxShadow = 'none';
                        });
                    } else {
                        el.addEventListener('mouseenter', () => {
                            el.style.backgroundColor = '#e2e8f0';
                            el.style.borderColor = '#94a3b8';
                            el.style.color = '#475569';
                        });
                        el.addEventListener('mouseleave', () => {
                            el.style.backgroundColor = '#f1f5f9';
                            el.style.borderColor = '#e2e8f0';
                            el.style.color = '#94a3b8';
                        });
                    }
                }
            })
        ]
    })
}

const triggerCanvasConfetti = (rating) => {
    // Only trigger for high ratings (7-10)
    if (rating < 7) return

    const colors = [
        '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#d946ef'
    ]

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999999;
    `
    document.body.appendChild(canvas)
    
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = 100 + (rating - 7) * 20
    const particles = []
    const gravity = 0.3
    const wind = 0.1

    // Create particles
    for (let i = 0; i < pieces; i++) {
        const isCircle = Math.random() > 0.5
        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2 + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 15,
            vy: -10 - Math.random() * 15,
            size: 4 + Math.random() * 8,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            isCircle: isCircle,
            life: 1,
            decay: 0.003 + Math.random() * 0.005
        })
    }

    let animationId = null

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        let alive = false
        
        particles.forEach(p => {
            // Update physics
            p.vx += (Math.random() - 0.5) * 0.5 + wind * 0.5
            p.vy += gravity
            p.x += p.vx
            p.y += p.vy
            p.rotation += p.rotationSpeed
            p.life -= p.decay
            
            if (p.life > 0) {
                alive = true
                
                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate((p.rotation * Math.PI) / 180)
                
                const alpha = Math.max(0, p.life)
                ctx.globalAlpha = alpha
                ctx.fillStyle = p.color
                
                if (p.isCircle) {
                    ctx.beginPath()
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
                    ctx.fill()
                } else {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
                }
                
                ctx.restore()
            }
        })
        
        if (alive) {
            animationId = requestAnimationFrame(animate)
        } else {
            // Remove canvas when done
            setTimeout(() => {
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas)
                }
            }, 100)
        }
    }

    animate()

    // Clean up after 5 seconds (safety)
    setTimeout(() => {
        if (animationId) {
            cancelAnimationFrame(animationId)
        }
        if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas)
        }
    }, 5000)
}

// Best Presenter Voting Component
const BestPresenterVote = ({ docId, eventId, sourceTable, onVoteComplete, hasVoted = false, currentRating = 0 }) => {
    let selectedRating = currentRating || 0
    let modalInstance = null

    const handleVote = async () => {
        if (selectedRating === 0) {
            Toast.warning('Please select a rating before voting.')
            return
        }

        try {
            const form = new FormData()
            form.append('voteBestPresenter', '1')
            form.append('docId', docId)
            form.append('eventId', eventId)
            form.append('rating', selectedRating)
            form.append('sourceTable', sourceTable || 'researchfile')

            const response = await fetch('/scoreboard', {
                method: 'POST',
                body: form
            })

            const data = await response.json()

            if (data.status) {
                Toast.success('Your vote has been recorded!')
                if (modalInstance && modalInstance.closeModal) {
                    modalInstance.closeModal()
                }
                if (onVoteComplete) onVoteComplete()
            } else {
                Toast.error(data.message || 'Failed to submit vote')
            }
        } catch (error) {
            console.error('Error voting for best presenter:', error)
            Toast.error('Error submitting vote. Please try again.')
        }
    }

    // Update star colors based on rating
    const updateStars = (container, rating) => {
        const buttons = container.querySelectorAll('.star-rating-btn')
        buttons.forEach((btn) => {
            const value = parseInt(btn.getAttribute('data-value'))
            const isActive = value <= rating
            const icon = btn.querySelector('i')

            if (isActive) {
                btn.classList.add('active')
                btn.classList.remove('inactive')
                if (icon) {
                    icon.style.color = '#f59e0b'
                }
            } else {
                btn.classList.add('inactive')
                btn.classList.remove('active')
                if (icon) {
                    icon.style.color = '#e2e8f0'
                }
            }
        })
    }

    // Create star elements with proper interaction
    const createStarElements = () => {
        const starContainer = document.createElement('div')
        starContainer.className = 'star-rating-container'
        starContainer.style.overflow = 'visible'

        for (let i = 1; i <= 10; i++) {
            const starBtn = document.createElement('button')
            starBtn.setAttribute('data-value', i)
            starBtn.className = `star-rating-btn ${i <= selectedRating ? 'active' : 'inactive'}`
            
            // Create the icon with explicit color
            const icon = document.createElement('i')
            icon.className = 'fa-solid fa-star'
            icon.style.cssText = `
                font-size: inherit;
                pointer-events: none;
                color: ${i <= selectedRating ? '#f59e0b' : '#e2e8f0'};
                transition: color 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
            `
            starBtn.appendChild(icon)
            
            starBtn.setAttribute('aria-label', `Rate ${i} out of 10`)
            starBtn.style.overflow = 'visible'
            starBtn.style.flexShrink = '0'
            starBtn.style.minWidth = '34px'
            starBtn.style.fontSize = '34px'
            starBtn.style.padding = '4px 3px'
            starBtn.style.cursor = 'pointer'
            starBtn.style.background = 'none'
            starBtn.style.border = 'none'
            starBtn.style.transition = 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            starBtn.style.display = 'flex'
            starBtn.style.alignItems = 'center'
            starBtn.style.justifyContent = 'center'
            starBtn.style.color = 'inherit' // Let the icon control color
            
            if (i <= selectedRating) {
                starBtn.style.transform = 'scale(1.08)'
            } else {
                starBtn.style.transform = 'scale(1)'
            }

            // Mouse enter - highlight up to this star
            starBtn.addEventListener('mouseenter', () => {
                updateStars(starContainer, i)
                const ratingText = document.querySelector('.rating-text')
                if (ratingText) {
                    ratingText.textContent = `Rating: ${i} / 10`
                    ratingText.className = 'rating-text selected'
                }
            })

            // Mouse leave - revert to selected rating
            starBtn.addEventListener('mouseleave', () => {
                const rating = selectedRating || 0
                updateStars(starContainer, rating)
                const ratingText = document.querySelector('.rating-text')
                if (ratingText) {
                    if (selectedRating > 0) {
                        ratingText.textContent = `Rating: ${selectedRating} / 10`
                        ratingText.className = 'rating-text selected'
                    } else {
                        ratingText.textContent = 'Click a star to rate'
                        ratingText.className = 'rating-text default'
                    }
                }
            })

            // Click - select this rating with confetti
            starBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                selectedRating = i
                updateStars(starContainer, i)
                const ratingText = document.querySelector('.rating-text')
                if (ratingText) {
                    ratingText.textContent = `Rating: ${i} / 10`
                    ratingText.className = 'rating-text selected'
                }
                starBtn.classList.add('pulse')
                setTimeout(() => {
                    starBtn.classList.remove('pulse')
                }, 300)

                // TRIGGER CONFETTI for high ratings (7-10)
                if (i >= 7) {
                    triggerCanvasConfetti(i)
                    
                    const messages = {
                        7: 'Great rating! 🌟',
                        8: 'Excellent choice! ⭐',
                        9: 'Outstanding! 🎉',
                        10: 'Perfect 10! 🏆🎊'
                    }
                    Toast.success(messages[i] || 'Amazing rating! 🎉', 2000)
                } else if (i >= 4) {
                    Toast.info(`Rating: ${i}/10 - Good choice! 👍`, 1500)
                }
            })

            starContainer.appendChild(starBtn)
        }

        return starContainer
    }

    const openVoteModal = () => {
        const starContainer = createStarElements()

        const ratingDisplay = document.createElement('div')
        ratingDisplay.className = 'rating-text default'
        ratingDisplay.textContent = selectedRating > 0 ? `Rating: ${selectedRating} / 10` : 'Click a star to rate'

        const labelsDiv = document.createElement('div')
        labelsDiv.className = 'rating-labels'
        labelsDiv.innerHTML = `
            <span class="poor"><i class="fa-regular fa-face-frown"></i> Poor</span>
            <span class="excellent"><i class="fa-regular fa-face-smile"></i> Excellent</span>
        `

        const hoverDesc = document.createElement('div')
        hoverDesc.className = 'hover-description'
        hoverDesc.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Hover over stars to preview, click to select'

        const contentContainer = document.createElement('div')
        contentContainer.className = 'vote-modal-content'
        contentContainer.style.overflow = 'visible'

        contentContainer.innerHTML = `
            <div class="vote-modal-icon-wrapper">
                <i class="fa-solid fa-trophy"></i>
            </div>
            <h3 class="vote-modal-title">${hasVoted ? 'Update Your Vote' : 'Vote for Best Presenter'}</h3>
            <p class="vote-modal-desc">Rate the presenter's delivery, clarity, and overall presentation quality.</p>
        `

        contentContainer.appendChild(starContainer)
        contentContainer.appendChild(labelsDiv)
        contentContainer.appendChild(ratingDisplay)
        contentContainer.appendChild(hoverDesc)

        const footer = ({ closeModal }) => {
            modalInstance = { closeModal }

            const footerDiv = document.createElement('div')
            footerDiv.className = 'vote-modal-footer'

            const cancelBtn = document.createElement('button')
            cancelBtn.className = 'cancel-btn'
            cancelBtn.textContent = 'Cancel'
            cancelBtn.addEventListener('click', closeModal)

            const submitBtn = document.createElement('button')
            submitBtn.className = 'vote-btn'
            submitBtn.textContent = hasVoted ? 'Update Vote' : 'Submit Vote'
            submitBtn.style.background = hasVoted ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            submitBtn.style.boxShadow = hasVoted ? '0 4px 14px rgba(245, 158, 11, 0.35)' : '0 4px 14px rgba(59, 130, 246, 0.35)'
            submitBtn.addEventListener('click', handleVote)

            footerDiv.appendChild(cancelBtn)
            footerDiv.appendChild(submitBtn)

            return footerDiv
        }

        CustomModal({
            title: hasVoted ? 'Update Best Presenter Vote' : 'Best Presenter Vote',
            content: contentContainer,
            footer: footer,
            size: 'small',
            closeOnOverlayClick: false,
            className: 'vote-modal'
        })
    }

    // Determine button style based on vote status - MATCHING "No Comments" style
    const getButtonStyle = () => {
        if (hasVoted) {
            return {
                border: '1px solid #f59e0b',
                background: '#fef3c7',
                color: '#d97706',
                fontWeight: '600'
            }
        }
        return {
            border: '1px solid #e2e8f0',
            background: '#f1f5f9',
            color: '#94a3b8',
            fontWeight: '600'
        }
    }

    const buttonStyle = getButtonStyle()

    return $({
        tag: 'button',
        style: {
            padding: '3px 10px',
            borderRadius: '12px',
            border: buttonStyle.border,
            background: buttonStyle.background,
            color: buttonStyle.color,
            fontSize: '11px',
            fontWeight: buttonStyle.fontWeight,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
        },
        child: [
            $({
                tag: 'span',
                att: { className: hasVoted ? 'fa-solid fa-check-circle' : 'fa-regular fa-star' },
                style: { fontSize: '11px' }
            }),
            $({
                tag: 'span',
                text: hasVoted ? `Voted (${currentRating})` : 'Vote'
            })
        ],
        event: {
            type: 'click',
            method: (e) => {
                e.stopPropagation()
                openVoteModal()
            }
        },
        elementHandler: (el) => {
            if (hasVoted) {
                el.addEventListener('mouseenter', () => {
                    el.style.background = '#fde68a'
                    el.style.transform = 'translateY(-1px)'
                    el.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.25)'
                })
                el.addEventListener('mouseleave', () => {
                    el.style.background = '#fef3c7'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                })
            } else {
                el.addEventListener('mouseenter', () => {
                    el.style.background = '#e2e8f0'
                    el.style.borderColor = '#94a3b8'
                    el.style.color = '#475569'
                })
                el.addEventListener('mouseleave', () => {
                    el.style.background = '#f1f5f9'
                    el.style.borderColor = '#e2e8f0'
                    el.style.color = '#94a3b8'
                })
            }
        }
    })
}

// Presented Button Component
const PresentedButton = ({ docId, eventName, sourceTable, completionStatus, onStatusUpdate }) => {
    const isStudentEvent = eventName && (
        eventName.toLowerCase().includes('undergraduate') ||
        eventName.toLowerCase().includes('graduate')
    )

    // Determine if the paper is already marked as presented
    const isPresented = completionStatus === 'completed'

    const handlePresented = async () => {
        if (isPresented) {
            Toast.info('This paper is already marked as presented.')
            return
        }

        const confirmModal = ConfirmationModal({
            title: 'Confirm Presentation',
            message: 'Mark this paper as presented? This will confirm that the presentation has been delivered.',
            confirmText: 'Yes, Mark as Presented',
            cancelText: 'Cancel',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    const form = new FormData()
                    form.append('markPresented', '1')
                    form.append('docId', docId)
                    form.append('sourceTable', sourceTable || 'researchfile')
                    form.append('isStudent', isStudentEvent ? '1' : '0')

                    const response = await fetch('/scoreboard', {
                        method: 'POST',
                        body: form
                    })

                    const data = await response.json()

                    if (data.status) {
                        Toast.success('Paper marked as presented successfully!')
                        if (onStatusUpdate) onStatusUpdate()
                    } else {
                        Toast.error(data.message || 'Failed to mark as presented')
                    }
                } catch (error) {
                    console.error('Error marking as presented:', error)
                    Toast.error('Error updating status. Please try again.')
                }
            }
        })
    }

    // Determine button style based on status - MATCHING "No Comments" style
    const getButtonStyle = () => {
        if (isPresented) {
            return {
                border: '1px solid #10b981',
                background: '#dcfce7',
                color: '#065f46',
                fontWeight: '600'
            }
        }
        return {
            border: '1px solid #e2e8f0',
            background: '#f1f5f9',
            color: '#94a3b8',
            fontWeight: '600'
        }
    }

    const buttonStyle = getButtonStyle()

    return $({
        tag: 'button',
        style: {
            padding: '3px 10px',
            borderRadius: '12px',
            border: buttonStyle.border,
            background: buttonStyle.background,
            color: buttonStyle.color,
            fontSize: '11px',
            fontWeight: buttonStyle.fontWeight,
            cursor: isPresented ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
        },
        child: [
            $({
                tag: 'span',
                att: { className: isPresented ? 'fa-solid fa-check-circle' : 'fa-regular fa-circle-check' },
                style: { fontSize: '11px' }
            }),
            $({
                tag: 'span',
                text: isPresented ? 'Presented' : 'Presented?'
            })
        ],
        event: {
            type: 'click',
            method: (e) => {
                e.stopPropagation()
                if (!isPresented) {
                    handlePresented()
                }
            }
        },
        elementHandler: (el) => {
            if (!isPresented) {
                el.addEventListener('mouseenter', () => {
                    el.style.background = '#e2e8f0'
                    el.style.borderColor = '#94a3b8'
                    el.style.color = '#475569'
                })
                el.addEventListener('mouseleave', () => {
                    el.style.background = '#f1f5f9'
                    el.style.borderColor = '#e2e8f0'
                    el.style.color = '#94a3b8'
                })
            }
        }
    })
}

export const BestPresenterRanking = ({ eventId, sourceTable = 'researchfile', onUpdate }) => {
    let rankingData = []
    let isLoading = false
    let modalInstance = null

    const loadRankingData = async () => {
        if (isLoading) return
        isLoading = true

        try {
            const form = new FormData()
            form.append('getBestPresenterRanking', '1')
            form.append('eventId', eventId)
            form.append('sourceTable', sourceTable)

            const response = await fetch('/scoreboard', {
                method: 'POST',
                body: form
            })

            const data = await response.json()

            if (data.status && data.data) {
                rankingData = data.data
                renderRankingList()
            } else {
                Toast.error(data.message || 'Failed to load ranking data')
            }
        } catch (error) {
            console.error('Error loading ranking:', error)
            Toast.error('Error loading ranking data')
        } finally {
            isLoading = false
        }
    }

    const getMedal = (index) => {
        const medals = ['🥇', '🥈', '🥉']
        return index < 3 ? medals[index] : `#${index + 1}`
    }

    const getMedalColor = (index) => {
        const colors = ['#f59e0b', '#94a3b8', '#cd7f32']
        return index < 3 ? colors[index] : '#64748b'
    }

    const getStarDisplay = (rating) => {
        const fullStars = Math.floor(rating)
        const halfStar = rating % 1 >= 0.5
        let stars = ''
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐'
        }
        if (halfStar) stars += '½'
        return stars || '☆'
    }

    const renderRankingList = () => {
        const container = document.getElementById('ranking-list-container')
        if (!container) return

        if (rankingData.length === 0) {
            container.innerHTML = `
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    color: #94a3b8;
                ">
                    <i class="fa-regular fa-trophy" style="font-size: 48px; display: block; margin-bottom: 16px; color: #cbd5e1;"></i>
                    <p style="font-size: 15px; margin: 0;">No votes have been cast yet.</p>
                    <p style="font-size: 13px; margin-top: 4px;">Be the first to vote for the Best Presenter!</p>
                </div>
            `
            return
        }

        const sorted = [...rankingData].sort((a, b) => (b.rating || 0) - (a.rating || 0))

        let html = `
            <div style="
                display: flex;
                justify-content: space-between;
                padding: 12px 16px;
                border-bottom: 2px solid #e8ecf0;
                font-size: 12px;
                font-weight: 600;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">
                <span style="width: 40px;">Rank</span>
                <span style="flex: 1; padding-left: 8px;">Presenter</span>
                <span style="width: 120px; text-align: center;">Rating</span>
                <span style="width: 80px; text-align: right;">Action</span>
            </div>
        `

        sorted.forEach((item, index) => {
            const medal = getMedal(index)
            const medalColor = getMedalColor(index)
            const starDisplay = getStarDisplay(item.rating || 0)
            const voteCount = item.voteCount || 0
            const isTopThree = index < 3
            const hasVoted = item.hasVoted || false

            html += `
                <div style="
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    background: ${isTopThree ? 'rgba(245, 158, 11, 0.04)' : 'transparent'};
                    transition: all 0.2s ease;
                    border-radius: 8px;
                    margin: 2px 0;
                " class="ranking-item" data-docid="${item.docId}">
                    <div style="
                        width: 40px;
                        font-weight: ${isTopThree ? '700' : '500'};
                        color: ${medalColor};
                        font-size: ${index < 3 ? '20px' : '14px'};
                    ">
                        ${medal}
                    </div>
                    <div style="
                        flex: 1;
                        padding-left: 8px;
                        min-width: 0;
                    ">
                        <div style="
                            font-weight: ${isTopThree ? '600' : '500'};
                            color: #0f172a;
                            font-size: 14px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        ">
                            ${item.presenter || 'Unknown Presenter'}
                        </div>
                        <div style="
                            font-size: 12px;
                            color: #94a3b8;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        ">
                            ${item.title || 'Untitled'}
                        </div>
                    </div>
                    <div style="
                        width: 120px;
                        text-align: center;
                    ">
                        <div style="
                            font-size: 18px;
                            letter-spacing: 2px;
                        ">
                            ${starDisplay}
                        </div>
                        <div style="
                            font-size: 12px;
                            color: #94a3b8;
                        ">
                            ${(item.rating || 0).toFixed(1)} / 10 (${voteCount} vote${voteCount !== 1 ? 's' : ''})
                        </div>
                    </div>
                    <div style="
                        width: 80px;
                        text-align: right;
                    ">
                        <button style="
                            padding: 4px 14px;
                            border-radius: 8px;
                            border: ${hasVoted ? '1px solid #f59e0b' : '1px solid #e8ecf0'};
                            background: ${hasVoted ? '#fef3c7' : 'transparent'};
                            color: ${hasVoted ? '#d97706' : '#94a3b8'};
                            font-size: 12px;
                            font-weight: ${hasVoted ? '600' : '400'};
                            cursor: pointer;
                            transition: all 0.2s ease;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        " class="edit-vote-btn" data-docid="${item.docId}" data-presenter="${item.presenter}" data-rating="${item.rating || 0}" data-hasvoted="${hasVoted}">
                            ${hasVoted ? '✏️ Edit' : 'Vote'}
                        </button>
                    </div>
                </div>
            `
        })

        container.innerHTML = html

        container.querySelectorAll('.edit-vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation()
                const docId = btn.getAttribute('data-docid')
                const presenter = btn.getAttribute('data-presenter')
                const currentRating = parseFloat(btn.getAttribute('data-rating')) || 0
                const hasVoted = btn.getAttribute('data-hasvoted') === 'true'
                openEditVoteModal(docId, presenter, currentRating, hasVoted)
            })
        })

        container.querySelectorAll('.ranking-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f8fafc'
                item.style.transform = 'translateX(4px)'
            })
            item.addEventListener('mouseleave', () => {
                const isTopThree = parseInt(item.querySelector('div:first-child')?.textContent?.match(/\d+/)?.[0] || 0) <= 3
                item.style.background = isTopThree ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                item.style.transform = 'translateX(0)'
            })
        })
    }

    const openEditVoteModal = (docId, presenter, currentRating, hasVoted) => {
        let selectedRating = currentRating
        let editModalInstance = null

        const handleUpdateVote = async () => {
            if (selectedRating === 0) {
                Toast.warning('Please select a rating.')
                return
            }

            try {
                const form = new FormData()
                form.append('updateBestPresenterVote', '1')
                form.append('docId', docId)
                form.append('eventId', eventId)
                form.append('rating', selectedRating)
                form.append('sourceTable', sourceTable)

                const response = await fetch('/scoreboard', {
                    method: 'POST',
                    body: form
                })

                const data = await response.json()

                if (data.status) {
                    Toast.success('Your vote has been updated!')
                    if (editModalInstance && editModalInstance.closeModal) {
                        editModalInstance.closeModal()
                    }
                    loadRankingData()
                    if (onUpdate) onUpdate()
                } else {
                    Toast.error(data.message || 'Failed to update vote')
                }
            } catch (error) {
                console.error('Error updating vote:', error)
                Toast.error('Error updating vote. Please try again.')
            }
        }

        const createEditStars = () => {
            const starContainer = document.createElement('div')
            starContainer.className = 'star-rating-container'
            starContainer.style.overflow = 'visible'
            starContainer.style.gap = '4px'

            for (let i = 1; i <= 10; i++) {
                const starBtn = document.createElement('button')
                starBtn.setAttribute('data-value', i)
                starBtn.className = `star-rating-btn ${i <= selectedRating ? 'active' : 'inactive'}`
                
                // Create the icon with explicit color
                const icon = document.createElement('i')
                icon.className = 'fa-solid fa-star'
                icon.style.cssText = `
                    font-size: inherit;
                    pointer-events: none;
                    color: ${i <= selectedRating ? '#f59e0b' : '#e2e8f0'};
                    transition: color 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
                `
                starBtn.appendChild(icon)
                
                starBtn.style.fontSize = '34px'
                starBtn.style.minWidth = '34px'
                starBtn.style.padding = '4px 3px'
                starBtn.style.cursor = 'pointer'
                starBtn.style.background = 'none'
                starBtn.style.border = 'none'
                starBtn.style.transition = 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
                starBtn.style.display = 'flex'
                starBtn.style.alignItems = 'center'
                starBtn.style.justifyContent = 'center'
                starBtn.style.color = 'inherit'
                
                if (i <= selectedRating) {
                    starBtn.style.transform = 'scale(1.08)'
                } else {
                    starBtn.style.transform = 'scale(1)'
                }

                starBtn.addEventListener('mouseenter', () => {
                    const buttons = starContainer.querySelectorAll('.star-rating-btn')
                    buttons.forEach((btn, idx) => {
                        const val = parseInt(btn.getAttribute('data-value'))
                        const iconEl = btn.querySelector('i')
                        if (val <= i) {
                            btn.classList.add('active')
                            btn.classList.remove('inactive')
                            if (iconEl) {
                                iconEl.style.color = '#f59e0b'
                            }
                            btn.style.transform = 'scale(1.1)'
                        } else {
                            btn.classList.remove('active')
                            btn.classList.add('inactive')
                            if (iconEl) {
                                iconEl.style.color = '#e2e8f0'
                            }
                            btn.style.transform = 'scale(1)'
                        }
                    })
                    const ratingText = document.getElementById('edit-rating-text')
                    if (ratingText) {
                        ratingText.textContent = `Rating: ${i} / 10`
                        ratingText.className = 'rating-text selected'
                    }
                })

                starBtn.addEventListener('mouseleave', () => {
                    const buttons = starContainer.querySelectorAll('.star-rating-btn')
                    buttons.forEach((btn) => {
                        const val = parseInt(btn.getAttribute('data-value'))
                        const iconEl = btn.querySelector('i')
                        if (val <= selectedRating) {
                            btn.classList.add('active')
                            btn.classList.remove('inactive')
                            if (iconEl) {
                                iconEl.style.color = '#f59e0b'
                            }
                            btn.style.transform = 'scale(1.08)'
                        } else {
                            btn.classList.remove('active')
                            btn.classList.add('inactive')
                            if (iconEl) {
                                iconEl.style.color = '#e2e8f0'
                            }
                            btn.style.transform = 'scale(1)'
                        }
                    })
                    const ratingText = document.getElementById('edit-rating-text')
                    if (ratingText) {
                        if (selectedRating > 0) {
                            ratingText.textContent = `Rating: ${selectedRating} / 10`
                            ratingText.className = 'rating-text selected'
                        } else {
                            ratingText.textContent = 'Click a star to rate'
                            ratingText.className = 'rating-text default'
                        }
                    }
                })

                starBtn.addEventListener('click', (e) => {
                    e.stopPropagation()
                    selectedRating = i
                    const buttons = starContainer.querySelectorAll('.star-rating-btn')
                    buttons.forEach((btn) => {
                        const val = parseInt(btn.getAttribute('data-value'))
                        const iconEl = btn.querySelector('i')
                        if (val <= i) {
                            btn.classList.add('active')
                            btn.classList.remove('inactive')
                            if (iconEl) {
                                iconEl.style.color = '#f59e0b'
                            }
                            btn.style.transform = 'scale(1.08)'
                        } else {
                            btn.classList.remove('active')
                            btn.classList.add('inactive')
                            if (iconEl) {
                                iconEl.style.color = '#e2e8f0'
                            }
                            btn.style.transform = 'scale(1)'
                        }
                    })
                    const ratingText = document.getElementById('edit-rating-text')
                    if (ratingText) {
                        ratingText.textContent = `Rating: ${i} / 10`
                        ratingText.className = 'rating-text selected'
                    }
                })

                starContainer.appendChild(starBtn)
            }

            return starContainer
        }

        const starContainer = createEditStars()

        const contentContainer = document.createElement('div')
        contentContainer.className = 'vote-modal-content'
        contentContainer.style.overflow = 'visible'
        contentContainer.style.padding = '4px 0'

        const presenterInfo = document.createElement('div')
        presenterInfo.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #e8ecf0;
        `
        presenterInfo.innerHTML = `
            <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">${hasVoted ? 'Updating vote for' : 'Editing vote for'}</div>
            <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${presenter || 'Unknown Presenter'}</div>
        `

        const ratingDisplay = document.createElement('div')
        ratingDisplay.id = 'edit-rating-text'
        ratingDisplay.className = `rating-text ${selectedRating > 0 ? 'selected' : 'default'}`
        ratingDisplay.textContent = selectedRating > 0 ? `Rating: ${selectedRating} / 10` : 'Click a star to rate'
        ratingDisplay.style.marginBottom = '10px'

        const labelsDiv = document.createElement('div')
        labelsDiv.className = 'rating-labels'
        labelsDiv.innerHTML = `
            <span class="poor"><i class="fa-regular fa-face-frown"></i> Poor</span>
            <span class="excellent"><i class="fa-regular fa-face-smile"></i> Excellent</span>
        `

        contentContainer.appendChild(presenterInfo)
        contentContainer.appendChild(starContainer)
        contentContainer.appendChild(labelsDiv)
        contentContainer.appendChild(ratingDisplay)

        const footer = ({ closeModal }) => {
            editModalInstance = { closeModal }

            const footerDiv = document.createElement('div')
            footerDiv.className = 'vote-modal-footer'

            const cancelBtn = document.createElement('button')
            cancelBtn.className = 'cancel-btn'
            cancelBtn.textContent = 'Cancel'
            cancelBtn.addEventListener('click', closeModal)

            const updateBtn = document.createElement('button')
            updateBtn.className = 'vote-btn'
            updateBtn.textContent = currentRating > 0 ? 'Update Vote' : 'Cast Vote'
            updateBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            updateBtn.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.35)'
            updateBtn.addEventListener('click', handleUpdateVote)

            footerDiv.appendChild(cancelBtn)
            footerDiv.appendChild(updateBtn)

            return footerDiv
        }

        CustomModal({
            title: `${currentRating > 0 ? 'Update' : 'Cast'} Vote`,
            content: contentContainer,
            footer: footer,
            size: 'small',
            closeOnOverlayClick: false,
            className: 'vote-modal'
        })
    }

    const openRankingModal = () => {
        const contentContainer = document.createElement('div')
        contentContainer.style.cssText = `
            padding: 0;
            overflow: hidden;
            max-width: 100%;
        `

        const headerStats = document.createElement('div')
        headerStats.style.cssText = `
            display: flex;
            gap: 16px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            margin-bottom: 20px;
        `
        headerStats.innerHTML = `
            <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #92400e;">${rankingData.length}</div>
                <div style="font-size: 12px; color: #78350f;">Presenters</div>
            </div>
            <div style="width: 1px; background: rgba(0,0,0,0.1);"></div>
            <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #92400e;">${rankingData.reduce((sum, item) => sum + (item.voteCount || 0), 0)}</div>
                <div style="font-size: 12px; color: #78350f;">Total Votes</div>
            </div>
            <div style="width: 1px; background: rgba(0,0,0,0.1);"></div>
            <div style="flex: 1; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #92400e;">${rankingData.length > 0 ? (rankingData.reduce((sum, item) => sum + (item.rating || 0), 0) / rankingData.length).toFixed(1) : '0'}</div>
                <div style="font-size: 12px; color: #78350f;">Avg Rating</div>
            </div>
        `

        const listContainer = document.createElement('div')
        listContainer.id = 'ranking-list-container'
        listContainer.style.cssText = `
            max-height: 450px;
            overflow-y: auto;
            padding-right: 4px;
        `

        contentContainer.appendChild(headerStats)
        contentContainer.appendChild(listContainer)

        loadRankingData()

        const footer = ({ closeModal }) => {
            modalInstance = { closeModal }

            const footerDiv = document.createElement('div')
            footerDiv.className = 'vote-modal-footer'
            footerDiv.style.justifyContent = 'space-between'

            const refreshBtn = document.createElement('button')
            refreshBtn.className = 'cancel-btn'
            refreshBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh'
            refreshBtn.style.display = 'flex'
            refreshBtn.style.alignItems = 'center'
            refreshBtn.style.gap = '6px'
            refreshBtn.addEventListener('click', () => {
                loadRankingData()
                Toast.info('Refreshing ranking...')
            })

            const closeBtn = document.createElement('button')
            closeBtn.className = 'vote-btn'
            closeBtn.textContent = 'Close'
            closeBtn.style.minWidth = '100px'
            closeBtn.addEventListener('click', closeModal)

            footerDiv.appendChild(refreshBtn)
            footerDiv.appendChild(closeBtn)

            return footerDiv
        }

        CustomModal({
            title: '🏆 Best Presenter Ranking',
            content: contentContainer,
            footer: footer,
            size: 'large',
            closeOnOverlayClick: true,
            className: 'ranking-modal'
        })
    }

    // Return a button that opens the ranking modal
    return $({
        tag: 'button',
        style: {
            padding: '6px 16px',
            borderRadius: '8px',
            border: '1px solid #8b5cf6',
            background: '#f5f3ff',
            color: '#7c3aed',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        child: [
            $({
                tag: 'span',
                att: { className: 'fa-solid fa-ranking-star' },
                style: { fontSize: '13px' }
            }),
            $({
                tag: 'span',
                text: 'Rankings'
            })
        ],
        event: {
            type: 'click',
            method: (e) => {
                e.stopPropagation()
                openRankingModal()
            }
        },
        elementHandler: (el) => {
            el.addEventListener('mouseenter', () => {
                el.style.background = '#ede9fe'
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.2)'
            })
            el.addEventListener('mouseleave', () => {
                el.style.background = '#f5f3ff'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
            })
        }
    })
}

export const EntryList = ({
    title,
    presenter,
    author,
    coAuthors,
    docId,
    index,
    center,
    status,
    eventId,
    catId,
    hasScore,
    hasComment,
    userType,
    categoryName,
    completionStatus = 'pending_confirmation',
    eventName = '',
    sourceTable = 'researchfile',
    onStatusUpdate = null,
    hasVoted = false,
    voteRating = 0
}) => {
    const base = window.location.href
    const url = base.replace(window.location.origin, '').split('/')

    if (url[2] === 'viewdocs') {
        document.getElementById('root').appendChild(EntryView({
            docId: url[3],
            title: title,
            eventId: eventId,
            catId: catId
        }))
    }

    const getCardStyle = () => {
        const statusStyles = {
            'completed': {
                borderLeft: '4px solid #10b981',
                background: '#f0fdf4'
            },
            'not_presented': {
                borderLeft: '4px solid #ef4444',
                background: '#fef2f2'
            },
            'pending_confirmation': {
                borderLeft: '4px solid #f59e0b',
                background: '#fffbeb'
            }
        }

        if (completionStatus && statusStyles[completionStatus]) {
            return statusStyles[completionStatus]
        }

        if (status === false) {
            return {
                borderLeft: '4px solid #f59e0b',
                background: '#fffbeb'
            }
        }
        if (hasScore && hasComment) {
            return {
                borderLeft: '4px solid #10b981',
                background: '#f0fdf4'
            }
        }
        if (hasScore) {
            return {
                borderLeft: '4px solid #8b5cf6',
                background: '#f5f3ff'
            }
        }
        if (hasComment) {
            return {
                borderLeft: '4px solid #3b82f6',
                background: '#eff6ff'
            }
        }
        return {
            borderLeft: '4px solid #e2e8f0',
            background: '#ffffff'
        }
    }

    const cardStyle = getCardStyle()
    const searchText = `${title} ${presenter} ${author} ${coAuthors || ''}`.toLowerCase()

    return ($({
        tag: 'div',
        externalStyle: '/client/component/evaluatorComponent/style/entrylist.css',
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            marginBottom: '10px',
            borderRadius: '10px',
            border: '1px solid #e8ecf1',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            background: cardStyle.background,
            borderLeft: cardStyle.borderLeft,
            position: 'relative',
            gap: '12px',
            flexWrap: 'wrap',
        },
        att: {
            className: 'entry-card',
            'data-search': searchText,
            'data-completion': completionStatus || 'pending',
            'data-has-vote': hasVoted ? 'true' : 'false',
        },
        child: [
            // Status dot
            $({
                tag: 'div',
                style: {
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: completionStatus === 'completed' ? '#10b981'
                        : completionStatus === 'not_presented' ? '#ef4444'
                        : status === false ? '#f59e0b'
                        : (hasScore && hasComment) ? '#10b981'
                            : hasScore ? '#8b5cf6'
                                : hasComment ? '#3b82f6'
                                    : '#94a3b8',
                    boxShadow: `0 0 8px ${completionStatus === 'completed' ? 'rgba(16,185,129,0.4)'
                        : completionStatus === 'not_presented' ? 'rgba(239,68,68,0.4)'
                        : status === false ? 'rgba(245,158,11,0.4)'
                        : (hasScore && hasComment) ? 'rgba(16,185,129,0.4)'
                            : hasScore ? 'rgba(139,92,246,0.4)'
                                : hasComment ? 'rgba(59,130,246,0.4)'
                                    : 'rgba(148,163,184,0.2)'}`,
                    alignSelf: 'flex-start',
                    marginTop: '4px',
                }
            }),

            // Content section
            $({
                tag: 'div',
                style: {
                    flex: '1',
                    minWidth: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                },
                child: [
                    // Title
                    $({
                        tag: 'div',
                        text: title || 'Untitled Document',
                        style: {
                            fontSize: '15px',
                            fontWeight: '600',
                            color: status === false ? '#b45309' : '#0f172a',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            lineHeight: '1.3',
                        }
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px 20px',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#64748b',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        },
                        child: [
                            // Presenter
                            presenter ? $({
                                tag: 'span',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#eff6ff',
                                    padding: '2px 10px 2px 6px',
                                    borderRadius: '12px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-user-tie'
                                        },
                                        style: {
                                            fontSize: '12px',
                                            color: '#3b82f6'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: presenter,
                                        style: {
                                            color: '#1e293b',
                                            fontWeight: '500',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: '(Presenter)',
                                        style: {
                                            color: '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '400',
                                        }
                                    })
                                ]
                            }) : null,

                            // Separator between Presenter and Author
                            presenter && author ? $({
                                tag: 'span',
                                text: '|',
                                style: {
                                    color: '#cbd5e1',
                                    fontSize: '14px',
                                }
                            }) : null,

                            // Author
                            author ? $({
                                tag: 'span',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#f0fdf4',
                                    padding: '2px 10px 2px 6px',
                                    borderRadius: '12px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-user-pen'
                                        },
                                        style: {
                                            fontSize: '12px',
                                            color: '#22c55e'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: author,
                                        style: {
                                            color: '#1e293b',
                                            fontWeight: '500',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: '(Author)',
                                        style: {
                                            color: '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '400',
                                        }
                                    })
                                ]
                            }) : null,

                            // Separator between Author and Co-authors
                            (presenter || author) && coAuthors ? $({
                                tag: 'span',
                                text: '|',
                                style: {
                                    color: '#cbd5e1',
                                    fontSize: '14px',
                                }
                            }) : null,

                            // Co-authors
                            coAuthors ? $({
                                tag: 'span',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#f5f3ff',
                                    padding: '2px 10px 2px 6px',
                                    borderRadius: '12px',
                                    maxWidth: '300px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-users'
                                        },
                                        style: {
                                            fontSize: '12px',
                                            color: '#8b5cf6',
                                            flexShrink: 0,
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: coAuthors,
                                        style: {
                                            color: '#475569',
                                            fontSize: '12px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: '(Co-authors)',
                                        style: {
                                            color: '#64748b',
                                            fontSize: '11px',
                                            fontWeight: '400',
                                            flexShrink: 0,
                                        }
                                    })
                                ]
                            }) : null,

                            // Status label (if pending review)
                            status === false ? $({
                                tag: 'span',
                                style: {
                                    padding: '2px 10px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: {
                                            className: 'fa-solid fa-clock'
                                        },
                                        style: {
                                            fontSize: '11px'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: 'Pending Review'
                                    })
                                ]
                            }) : null
                        ]
                    }),
                    categoryName ? $({
                        tag: 'span',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f0f9ff',
                            padding: '2px 10px 2px 6px',
                            borderRadius: '12px',
                            border: '1px solid #bae6fd',
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-tag'
                                },
                                style: {
                                    fontSize: '11px',
                                    color: '#0284c7'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: categoryName,
                                style: {
                                    color: '#0369a1',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                }
                            })
                        ]
                    }) : null,
                ]
            }),

            // Action buttons
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    flexWrap: 'wrap',
                },
                child: [
                    // Status Labels - Pending, No Comments, Not Scored
                    StatusLabels({
                        hasScore: hasScore || false,
                        hasComment: hasComment || false,
                        completionStatus: completionStatus || 'pending_confirmation'
                    }),

                    // Presented? button - MATCHES "No Comments" style when not presented
                    PresentedButton({
                        docId: docId,
                        eventName: eventName,
                        sourceTable: sourceTable || 'researchfile',
                        completionStatus: completionStatus || 'pending_confirmation',
                        onStatusUpdate: onStatusUpdate
                    }),

                    // Best Presenter Vote button - MATCHES "No Comments" style when not voted
                    BestPresenterVote({
                        docId: docId,
                        eventId: eventId,
                        sourceTable: sourceTable || 'researchfile',
                        onVoteComplete: onStatusUpdate,
                        hasVoted: hasVoted || false,
                        currentRating: voteRating || 0
                    }),

                    // View action button
                    $({
                        tag: 'button',
                        style: {
                            padding: '6px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#3b82f6',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        },
                        att: {
                            className: 'view-btn'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-eye'
                                }
                            }),
                            $({
                                tag: 'span',
                                text: 'View'
                            })
                        ],
                        event: {
                            type: 'click',
                            method: (e) => {
                                e.stopPropagation()
                                window.location.assign('/evaluator/viewdocs/' + docId + '?eventId=' + eventId)
                            }
                        },
                        elementHandler: (el) => {
                            el.addEventListener('mouseenter', () => {
                                el.style.background = '#2563eb'
                                el.style.transform = 'translateY(-1px)'
                                el.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)'
                            })
                            el.addEventListener('mouseleave', () => {
                                el.style.background = '#3b82f6'
                                el.style.transform = 'translateY(0)'
                                el.style.boxShadow = 'none'
                            })
                        }
                    })
                ]
            })
        ],
        event: {
            type: 'click',
            method: () => {
                const existingContainer = document.getElementById('entry-view-container')
                if (existingContainer) {
                    existingContainer.remove()
                }
                document.querySelectorAll('.custom-modal-overlay').forEach(el => el.remove())
                window.location.assign('/evaluator/viewdocs/' + docId + '?eventId=' + eventId)
            }
        }
    }))
}