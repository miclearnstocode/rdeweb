import { $, baseCheck, Request, CustomModal, Toast, ConfirmationModal } from '../../../lib/lib.js'
import { EntryView } from "./entryview.js"

// Modern Status Labels Component with Font Awesome
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
                ]
            }),

            // Comment Status Label
            $({
                tag: 'span',
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
                ]
            }),

            // Score Status Label
            $({
                tag: 'span',
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
                ]
            })
        ]
    })
}

// =============================================
// CONFETTI EFFECT - Modern Celebration
// =============================================
const triggerConfetti = (rating) => {
    // Only trigger for high ratings (7-10)
    if (rating < 7) return

    const colors = [
        '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#d946ef'
    ]

    const container = document.body
    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Create confetti pieces
    const pieces = 80 + (rating - 7) * 15 // More pieces for higher ratings

    for (let i = 0; i < pieces; i++) {
        const confetti = document.createElement('div')
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = 6 + Math.random() * 10
        const isCircle = Math.random() > 0.5
        
        // Random starting position (spread from center)
        const angle = Math.random() * Math.PI * 2
        const distance = 50 + Math.random() * 100
        const startX = centerX + Math.cos(angle) * distance - size / 2
        const startY = centerY + Math.sin(angle) * distance - size / 2
        
        // Random target position
        const targetX = (Math.random() - 0.5) * rect.width * 1.5
        const targetY = (Math.random() - 0.5) * rect.height * 1.5
        
        // Random rotation
        const rotation = Math.random() * 720 - 360
        
        confetti.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            width: ${size}px;
            height: ${isCircle ? size : size * 0.4}px;
            background: ${color};
            border-radius: ${isCircle ? '50%' : '2px'};
            pointer-events: none;
            z-index: 999999;
            opacity: 1;
            box-shadow: 0 0 6px rgba(0,0,0,0.1);
            transform: rotate(0deg);
            transition: none;
        `
        
        container.appendChild(confetti)
        
        // Animate with requestAnimationFrame for smooth motion
        const startTime = performance.now()
        const duration = 1500 + Math.random() * 1000
        const startXPos = startX
        const startYPos = startY
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3)
            
            // Add some wobble
            const wobble = Math.sin(progress * Math.PI * 4 + i) * 20
            
            const x = startXPos + targetX * ease + wobble
            const y = startYPos + targetY * ease - 200 * ease * ease
            
            // Fade out near the end
            const opacity = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5
            
            confetti.style.left = `${x}px`
            confetti.style.top = `${y}px`
            confetti.style.transform = `rotate(${rotation * progress}deg) scale(${1 + progress * 0.5})`
            confetti.style.opacity = Math.max(0, opacity)
            
            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                // Remove after animation completes
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti)
                    }
                }, 100)
            }
        }
        
        // Start with a slight delay for each piece
        setTimeout(() => {
            requestAnimationFrame(animate)
        }, Math.random() * 300)
    }
}

// =============================================
// ALTERNATIVE: Canvas-based confetti (more performant)
// =============================================
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

// Best Presenter Voting Component - Modern White Design
const BestPresenterVote = ({ docId, eventId, sourceTable, onVoteComplete }) => {
    let selectedRating = 0
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

            if (isActive) {
                btn.classList.add('active')
                btn.classList.remove('inactive')
            } else {
                btn.classList.add('inactive')
                btn.classList.remove('active')
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
            starBtn.className = 'star-rating-btn inactive'
            starBtn.innerHTML = '★'
            starBtn.setAttribute('aria-label', `Rate ${i} out of 10`)
            starBtn.style.overflow = 'visible'
            starBtn.style.flexShrink = '0'
            starBtn.style.minWidth = '34px'

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
                    // Use canvas confetti (more performant)
                    triggerCanvasConfetti(i)
                    
                    // Also add a small celebration message
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

        // Modern circular icon badge instead of raw emoji
        contentContainer.innerHTML = `
            <div class="vote-modal-icon-wrapper">
                <i class="fa-solid fa-trophy"></i>
            </div>
            <h3 class="vote-modal-title">Vote for Best Presenter</h3>
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
            submitBtn.textContent = 'Submit Vote'
            submitBtn.addEventListener('click', handleVote)

            footerDiv.appendChild(cancelBtn)
            footerDiv.appendChild(submitBtn)

            return footerDiv
        }

        CustomModal({
            title: 'Best Presenter Vote',
            content: contentContainer,
            footer: footer,
            size: 'small',
            closeOnOverlayClick: false,
            className: 'vote-modal'
        })
    }

    return $({
        tag: 'button',
        style: {
            padding: '5px 14px',
            borderRadius: '8px',
            border: '1px solid #f59e0b',
            background: '#fffbeb',
            color: '#d97706',
            fontSize: '12px',
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
                att: { className: 'fa-solid fa-trophy' },
                style: { fontSize: '12px' }
            }),
            $({
                tag: 'span',
                text: 'Vote Best Presenter'
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
            el.addEventListener('mouseenter', () => {
                el.style.background = '#fef3c7'
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)'
            })
            el.addEventListener('mouseleave', () => {
                el.style.background = '#fffbeb'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
            })
        }
    })
}

// Presented Button Component
const PresentedButton = ({ docId, eventName, sourceTable, completionStatus, onStatusUpdate }) => {
    const isStudentEvent = eventName && (
        eventName.toLowerCase().includes('undergraduate') ||
        eventName.toLowerCase().includes('graduate')
    )

    const handlePresented = async () => {
        // Check if already presented
        if (completionStatus === 'completed') {
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

    // Only show for documents with pending_confirmation status
    if (completionStatus !== 'pending_confirmation') {
        return null
    }

    return $({
        tag: 'button',
        style: {
            padding: '5px 14px',
            borderRadius: '8px',
            border: '1px solid #10b981',
            background: '#ecfdf5',
            color: '#065f46',
            fontSize: '12px',
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
                att: { className: 'fa-solid fa-check-circle' },
                style: { fontSize: '12px' }
            }),
            $({
                tag: 'span',
                text: 'Presented?'
            })
        ],
        event: {
            type: 'click',
            method: (e) => {
                e.stopPropagation()
                handlePresented()
            }
        },
        elementHandler: (el) => {
            el.addEventListener('mouseenter', () => {
                el.style.background = '#d1fae5'
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)'
            })
            el.addEventListener('mouseleave', () => {
                el.style.background = '#ecfdf5'
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
    onStatusUpdate = null
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
        // Completion status styles
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

        // Override with completion status if available
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
        // Load the CSS file externally
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
                    gap: '10px',
                    flexShrink: 0,
                    flexWrap: 'wrap',
                },
                child: [
                    // Status Labels
                    StatusLabels({
                        hasScore: hasScore || false,
                        hasComment: hasComment || false,
                        completionStatus: completionStatus || 'pending_confirmation'
                    }),

                    // Presented? button
                    PresentedButton({
                        docId: docId,
                        eventName: eventName,
                        sourceTable: sourceTable || 'researchfile',
                        completionStatus: completionStatus || 'pending_confirmation',
                        onStatusUpdate: onStatusUpdate
                    }),

                    // Best Presenter Vote button
                    BestPresenterVote({
                        docId: docId,
                        eventId: eventId,
                        sourceTable: sourceTable || 'researchfile',
                        onVoteComplete: onStatusUpdate
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