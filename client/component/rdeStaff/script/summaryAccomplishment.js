import { $, Waiting } from "../../../lib/lib.js";
import { onGoingResearch } from "./accomplishmentReport/onGoingRes.js";
import { completedResearch } from "./accomplishmentReport/completedRes.js"
import { conductedResearch } from "./accomplishmentReport/conductedRes.js"


export const SummaryAccomplishment = () => {
    let mainContainer
    let tableBody
    let scrollContainer
    let accomplishmentData = []
    let filteredData = []
    let activeFilters = {
        campus: 'all',
        center: 'all',
    }
    let modalElement = null
    let loadingElement = null
    let isLoading = false

    // Statistics cards data
    const statsCards = [
        {
            key: 'ongoingResearch',
            label: 'On Going Researches',
            icon: 'fa-flask',
            color: '#4caf50',
            gradient: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
        },
        {
            key: 'completedResearch',
            label: 'Completed Researches',
            icon: 'fa-check-circle',
            color: '#2196f3',
            gradient: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)'
        },
        {
            key: 'conductedResearch',
            label: 'Research Trainings/Activity Conducted',
            icon: 'fa-chalkboard-teacher',
            color: '#ff9800',
            gradient: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)'
        },
        {
            key: 'facultyPresentation',
            label: 'Faculty Presentations',
            icon: 'fa-video',
            color: '#9c27b0',
            gradient: 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)'
        },
        {
            key: 'facultyTraining',
            label: 'Faculty Research Training Attended',
            icon: 'fa-user-graduate',
            color: '#00bcd4',
            gradient: 'linear-gradient(135deg, #00bcd4 0%, #00838f 100%)'
        },
        {
            key: 'igpProjects',
            label: 'IGP Research Projects',
            icon: 'fa-project-diagram',
            color: '#ff5722',
            gradient: 'linear-gradient(135deg, #ff5722 0%, #bf360c 100%)'
        },
        {
            key: 'exhibits',
            label: 'Participation to Exhibits',
            icon: 'fa-flag',
            color: '#795548',
            gradient: 'linear-gradient(135deg, #795548 0%, #4e342e 100%)'
        },
        {
            key: 'facilities',
            label: 'Facilities Improvement',
            icon: 'fa-building',
            color: '#607d8b',
            gradient: 'linear-gradient(135deg, #607d8b 0%, #37474f 100%)'
        },
        {
            key: 'publications',
            label: 'Publications',
            icon: 'fa-book',
            color: '#e91e63',
            gradient: 'linear-gradient(135deg, #e91e63 0%, #880e4f 100%)'
        },
        {
            key: 'citations',
            label: 'Research Citations',
            icon: 'fa-quote-right',
            color: '#3f51b5',
            gradient: 'linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)'
        }
    ]

    // Campus filter options
    const campusOptions = [
        { value: 'all', label: 'All Campuses' },
        { value: 'Tapaz', label: 'Tapaz' },
        { value: 'Burias', label: 'Burias' },
        { value: 'Dumarao', label: 'Dumarao' },
        { value: 'Pontevedra', label: 'Pontevedra' },
        { value: 'Mambusao', label: 'Mambusao' },
        { value: 'Sigma', label: 'Sigma' },
        { value: 'Pilar', label: 'Pilar' },
        { value: 'Dayao', label: 'Dayao' },
        { value: 'Roxas', label: 'Roxas' }
    ]

    // Center filter options
    const centerOptions = [
        { value: 'all', label: 'All Centers' },
        { value: 'CSRDC', label: 'Crop Science Research & Development Center (CSRDC)' },
        { value: 'LRDC', label: 'Livestock Research & Development Center (LRDC)' },
        { value: 'FRDC', label: 'Fisheries Research & Development Center (FRDC)' },
        { value: 'FIRDC', label: 'Food and Industrial Technology Research & Development Center (FIRDC)' },
        { value: 'SSRDC', label: 'Social Science Research & Development Center (SSRDC)' },
        { value: 'MATEC', label: 'Machinery and Agricultural Technology Engineering Center (MATEC)' },
        { value: 'CocoRDC', label: 'Coconut Research and Development Center (Coco RDC)' },
        { value: 'Extension', label: 'Extension' }
    ]

    // Show loading
    const showLoading = () => {
        if (!loadingElement) {
            loadingElement = Waiting()
            document.body.appendChild(loadingElement)
        }
    }

    // Hide loading
    const hideLoading = () => {
        if (loadingElement) {
            loadingElement.remove()
            loadingElement = null
        }
    }

    // Fetch summary data from API
    const fetchSummaryData = async () => {
        if (isLoading) return

        isLoading = true
        showLoading()

        try {
            // Prepare for API implementation
            const formData = new FormData()
            formData.append('action', 'fetch_summary')

            // Add active filters
            if (activeFilters.campus !== 'all') {
                formData.append('campus', activeFilters.campus)
            }
            if (activeFilters.center !== 'all') {
                formData.append('center', activeFilters.center)
            }
            if (activeFilters.category !== 'all') {
                formData.append('category', activeFilters.category)
            }

            // TODO: Replace with actual API endpoint when ready
            const response = await fetch('/api/summary/accomplishment', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.status) {
                accomplishmentData = result.data || []

                // Update stats cards with server data
                if (result.stats) {
                    updateStatsCards(result.stats)
                }

                // Update table with accomplishments
                updateTableWithData()
            } else {
                console.error('Failed to fetch summary data:', result.message)
                showEmptyState()
            }
        } catch (error) {
            console.error('Error fetching summary data:', error)
            // For development, use placeholder data
            usePlaceholderData()
        } finally {
            isLoading = false
            hideLoading()
        }
    }

    // Placeholder data for development
    const usePlaceholderData = () => {
        const placeholderStats = {}
        statsCards.forEach(card => {
            placeholderStats[card.key] = Math.floor(Math.random() * 50)
        })
        updateStatsCards(placeholderStats)
    }

    // Update statistics cards with data
    const updateStatsCards = (stats) => {
        const statsContainer = document.querySelector('.summary-stats-container')
        if (!statsContainer) return

        statsContainer.innerHTML = ''

        statsCards.forEach(stat => {
            const statCard = $({
                tag: 'div',
                att: {
                    className: 'summary-stat-card',
                    'data-stat-key': stat.key
                },
                style: {
                    background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    border: '1px solid #333',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '120px'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        e.stopPropagation()
                        openDetailModal(stat)
                    },
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)'
                        e.currentTarget.style.borderColor = stat.color
                        e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}20`
                        const overlay = e.currentTarget.querySelector('.stat-overlay')
                        if (overlay) overlay.style.opacity = '1'
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = '#333'
                        e.currentTarget.style.boxShadow = 'none'
                        const overlay = e.currentTarget.querySelector('.stat-overlay')
                        if (overlay) overlay.style.opacity = '0'
                    }
                },
                child: [
                    // Gradient overlay
                    $({
                        tag: 'div',
                        att: { className: 'stat-overlay' },
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            background: stat.gradient,
                            opacity: '0',
                            transition: 'opacity 0.3s ease',
                            borderRadius: '16px'
                        }
                    }),
                    // Icon and value row
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            position: 'relative',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: `${stat.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${stat.color}40`
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: `fa-solid ${stat.icon}` },
                                        style: {
                                            color: stat.color,
                                            fontSize: '20px',
                                            transition: 'transform 0.3s ease'
                                        }
                                    })
                                ]
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'stat-value' },
                                        text: '0',
                                        style: {
                                            fontSize: '32px',
                                            fontWeight: '700',
                                            color: '#fff',
                                            lineHeight: '1.2',
                                            transition: 'color 0.3s ease'
                                        }
                                    }),
                                    $({
                                        tag: 'span',
                                        att: { className: 'stat-trend' },
                                        style: {
                                            fontSize: '11px',
                                            color: '#4caf50',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    // Label
                    $({
                        tag: 'div',
                        style: {
                            position: 'relative',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'span',
                                text: stat.label,
                                style: {
                                    fontSize: '13px',
                                    color: '#aaa',
                                    fontWeight: '500',
                                    lineHeight: '1.4',
                                    display: '-webkit-box',
                                    WebkitLineClamp: '2',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    transition: 'color 0.3s ease'
                                }
                            })
                        ]
                    }),
                    // Click indicator
                    $({
                        tag: 'div',
                        style: {
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: '1'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-arrow-right' },
                                style: {
                                    fontSize: '12px',
                                    color: stat.color,
                                    opacity: '0',
                                    transition: 'all 0.3s ease',
                                    transform: 'translateX(-10px)'
                                }
                            })
                        ]
                    })
                ]
            })

            // Update the value from stats
            const valueEl = statCard.querySelector('.stat-value')
            if (valueEl && stats[stat.key] !== undefined) {
                valueEl.textContent = stats[stat.key]
            }

            statsContainer.appendChild(statCard)
        })
    }

    // Open detail modal for a statistics category
    const openDetailModal = (stat) => {
        if (modalElement) {
            modalElement.remove()
        }
        // Check if this is the "On Going Researches" card
        if (stat.key === 'ongoingResearch') {
            // Create modal container
            modalElement = $({
                tag: 'div',
                att: { className: 'summary-detail-modal-overlay' },
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '10000',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        if (e.target.className === 'summary-detail-modal-overlay') {
                            closeModal()
                        }
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#1e1e1e',
                            width: '95%',
                            maxWidth: '95%',
                            height: '90vh',
                            maxHeight: '90vh',
                            borderRadius: '20px',
                            border: '1px solid #333',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transform: 'scale(0.9) translateY(20px)',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative'
                        },
                        child: [
                            // Close button
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    zIndex: '10001'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-times' },
                                        style: {
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '20px',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: closeModal,
                                            type2: 'mouseenter',
                                            method2: (e) => {
                                                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'
                                                e.target.style.color = '#fff'
                                            },
                                            type3: 'mouseleave',
                                            method3: (e) => {
                                                e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'
                                                e.target.style.color = '#888'
                                            }
                                        }
                                    })
                                ]
                            }),
                            // On Going Research content
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'auto'
                                },
                                elementHandler: (el) => {
                                    // Append the onGoingResearch component
                                    const ongoingComponent = onGoingResearch()
                                    if (ongoingComponent) {
                                        el.appendChild(ongoingComponent)
                                    }
                                }
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modalElement)

            // Trigger animation
            setTimeout(() => {
                if (modalElement) {
                    modalElement.style.opacity = '1'
                    const modalBox = modalElement.querySelector('.summary-modal-box, div[style*="border-radius: 20px"]')
                    if (modalBox && modalBox.style) {
                        modalBox.style.transform = 'scale(1) translateY(0)'
                    }
                }
            }, 10)

            return
        }

        if (stat.key === 'completedResearch') {
            // Create modal container similar to ongoingResearch but with completedResearch component
            modalElement = $({
                tag: 'div',
                att: { className: 'summary-detail-modal-overlay' },
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '1000',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        if (e.target.className === 'summary-detail-modal-overlay') {
                            closeModal()
                        }
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#1e1e1e',
                            width: '95%',
                            maxWidth: '95%',
                            height: '90vh',
                            maxHeight: '90vh',
                            borderRadius: '20px',
                            border: '1px solid #333',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transform: 'scale(0.9) translateY(20px)',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative'
                        },
                        child: [
                            // Close button
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    zIndex: '1001'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-times' },
                                        style: {
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '20px',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: closeModal,
                                            type2: 'mouseenter',
                                            method2: (e) => {
                                                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'
                                                e.target.style.color = '#fff'
                                            },
                                            type3: 'mouseleave',
                                            method3: (e) => {
                                                e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'
                                                e.target.style.color = '#888'
                                            }
                                        }
                                    })
                                ]
                            }),
                            // Completed Research content
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'auto'
                                },
                                elementHandler: (el) => {
                                    const completedComponent = completedResearch()
                                    if (completedComponent) {
                                        el.appendChild(completedComponent)
                                    }
                                }
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modalElement)

            // Trigger animation
            setTimeout(() => {
                if (modalElement) {
                    modalElement.style.opacity = '1'
                    const modalBox = modalElement.querySelector('div[style*="border-radius: 20px"]')
                    if (modalBox && modalBox.style) {
                        modalBox.style.transform = 'scale(1) translateY(0)'
                    }
                }
            }, 10)

            return
        }
        if (stat.key === 'conductedResearch') {
            // Create modal container similar to ongoingResearch but with conductedResearch component
            modalElement = $({
                tag: 'div',
                att: { className: 'summary-detail-modal-overlay' },
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: '1000',
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                },
                event: {
                    type: 'click',
                    method: (e) => {
                        if (e.target.className === 'summary-detail-modal-overlay') {
                            closeModal()
                        }
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            backgroundColor: '#1e1e1e',
                            width: '95%',
                            maxWidth: '95%',
                            height: '90vh',
                            maxHeight: '90vh',
                            borderRadius: '20px',
                            border: '1px solid #333',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transform: 'scale(0.9) translateY(20px)',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative'
                        },
                        child: [
                            // Close button
                            $({
                                tag: 'div',
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    zIndex: '1001'
                                },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-times' },
                                        style: {
                                            color: '#888',
                                            cursor: 'pointer',
                                            fontSize: '20px',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            transition: 'all 0.2s ease'
                                        },
                                        event: {
                                            type: 'click',
                                            method: closeModal,
                                            type2: 'mouseenter',
                                            method2: (e) => {
                                                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'
                                                e.target.style.color = '#fff'
                                            },
                                            type3: 'mouseleave',
                                            method3: (e) => {
                                                e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'
                                                e.target.style.color = '#888'
                                            }
                                        }
                                    })
                                ]
                            }),
                            // Completed Research content
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'auto'
                                },
                                elementHandler: (el) => {
                                    const conductedComponent = conductedResearch()
                                    if (conductedComponent) {
                                        el.appendChild(conductedComponent)
                                    }
                                }
                            })
                        ]
                    })
                ]
            })

            document.body.appendChild(modalElement)

            // Trigger animation
            setTimeout(() => {
                if (modalElement) {
                    modalElement.style.opacity = '1'
                    const modalBox = modalElement.querySelector('div[style*="border-radius: 20px"]')
                    if (modalBox && modalBox.style) {
                        modalBox.style.transform = 'scale(1) translateY(0)'
                    }
                }
            }, 10)

            return
        }

        // Placeholder for modal content - you can implement the actual modal later
        const modalContent = getModalContent(stat)

        modalElement = $({
            tag: 'div',
            att: { className: 'summary-detail-modal-overlay' },
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '1000',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            },
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target.className === 'summary-detail-modal-overlay') {
                        closeModal()
                    }
                }
            },
            child: [modalContent]
        })

        document.body.appendChild(modalElement)

        // Trigger animation
        setTimeout(() => {
            if (modalElement) {
                modalElement.style.opacity = '1'
                const modalBox = modalElement.querySelector('.summary-modal-box')
                if (modalBox) {
                    modalBox.style.transform = 'scale(1) translateY(0)'
                }
            }
        }, 10)
    }

    // Get modal content based on stat type
    const getModalContent = (stat) => {
        return $({
            tag: 'div',
            att: { className: 'summary-modal-box' },
            style: {
                backgroundColor: '#1e1e1e',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '85vh',
                borderRadius: '20px',
                border: '1px solid #333',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transform: 'scale(0.9) translateY(20px)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            },
            child: [
                // Modal header
                $({
                    tag: 'div',
                    style: {
                        padding: '24px',
                        borderBottom: `2px solid ${stat.color}40`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: `linear-gradient(135deg, ${stat.color}10 0%, transparent 100%)`
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        backgroundColor: `${stat.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            att: { className: `fa-solid ${stat.icon}` },
                                            style: { color: stat.color, fontSize: '20px' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'h3',
                                    text: stat.label,
                                    style: {
                                        color: '#fff',
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        margin: '0'
                                    }
                                })
                            ]
                        }),
                        $({
                            tag: 'span',
                            att: { className: 'fa-solid fa-times' },
                            style: {
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '8px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: closeModal,
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.target.style.backgroundColor = '#333'
                                    e.target.style.color = '#fff'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = '#888'
                                }
                            }
                        })
                    ]
                }),
                // Modal body
                $({
                    tag: 'div',
                    style: {
                        padding: '24px',
                        overflow: 'auto',
                        flex: '1'
                    },
                    child: [
                        // Placeholder content
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px 20px',
                                textAlign: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: `fa-solid ${stat.icon}` },
                                    style: {
                                        fontSize: '48px',
                                        color: stat.color,
                                        marginBottom: '20px',
                                        opacity: '0.5'
                                    }
                                }),
                                $({
                                    tag: 'p',
                                    text: `Detailed view for "${stat.label}" will be implemented here.`,
                                    style: {
                                        color: '#aaa',
                                        fontSize: '16px',
                                        lineHeight: '1.6',
                                        marginBottom: '10px'
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                        marginTop: '20px'
                                    },
                                    child: [
                                        createFilterBadge('Campus:', activeFilters.campus === 'all' ? 'All' : activeFilters.campus, stat.color),
                                        createFilterBadge('Center:', activeFilters.center === 'all' ? 'All' : activeFilters.center, stat.color),
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                // Modal footer
                $({
                    tag: 'div',
                    style: {
                        padding: '16px 24px',
                        borderTop: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Close',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: '#333',
                                border: '1px solid #444',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: closeModal,
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.target.style.backgroundColor = '#444'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.target.style.backgroundColor = '#333'
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

    // Create filter badge
    const createFilterBadge = (label, value, color) => {
        return $({
            tag: 'span',
            style: {
                padding: '6px 12px',
                backgroundColor: `${color}15`,
                border: `1px solid ${color}30`,
                borderRadius: '20px',
                fontSize: '12px',
                color: '#ccc',
                display: 'inline-flex',
                gap: '6px'
            },
            child: [
                $({
                    tag: 'span',
                    text: label,
                    style: { color: '#888' }
                }),
                $({
                    tag: 'span',
                    text: value,
                    style: { color: color, fontWeight: '500' }
                })
            ]
        })
    }

    // Close modal
    const closeModal = () => {
        if (modalElement) {
            modalElement.style.opacity = '0'
            const modalBox = modalElement.querySelector('.summary-modal-box')
            if (modalBox) {
                modalBox.style.transform = 'scale(0.9) translateY(20px)'
            }

            setTimeout(() => {
                if (modalElement && modalElement.remove) {
                    modalElement.remove()
                    modalElement = null
                }
            }, 300)
        }
    }

    // Apply filters
    const applyFilters = () => {
        // Recalculate stats based on filters
        const filteredStats = {}
        statsCards.forEach(card => {
            filteredStats[card.key] = 0
        })

        if (accomplishmentData.length > 0) {
            // Filter data based on active filters
            const filtered = accomplishmentData.filter(item => {
                const campusMatch = activeFilters.campus === 'all' || item.campus === activeFilters.campus
                const centerMatch = activeFilters.center === 'all' || item.center === activeFilters.center
                const categoryMatch = activeFilters.category === 'all' || item.category === activeFilters.category
                return campusMatch && centerMatch && categoryMatch
            })

            // Count stats from filtered data
            filtered.forEach(item => {
                if (item.statKey && filteredStats[item.statKey] !== undefined) {
                    filteredStats[item.statKey]++
                }
            })
        }

        updateStatsCards(filteredStats)
        updateFilterBadges()
    }

    // Update filter badges
    const updateFilterBadges = () => {
        const badgesContainer = document.querySelector('.active-filters-container')
        if (!badgesContainer) return

        badgesContainer.innerHTML = ''

        if (activeFilters.campus !== 'all') {
            badgesContainer.appendChild(createFilterBadge('Campus:', activeFilters.campus, '#2196f3'))
        }
        if (activeFilters.center !== 'all') {
            const centerLabel = centerOptions.find(c => c.value === activeFilters.center)?.label || activeFilters.center
            badgesContainer.appendChild(createFilterBadge('Center:', centerLabel.substring(0, 30) + '...', '#ff9800'))
        }
    }

    // Filter by campus
    const filterByCampus = (campus) => {
        activeFilters.campus = campus
        applyFilters()
    }

    // Filter by center
    const filterByCenter = (center) => {
        activeFilters.center = center
        applyFilters()
    }

    // Filter by category
    const filterByCategory = (category) => {
        activeFilters.category = category
        applyFilters()
    }

    // Update table with data
    const updateTableWithData = () => {
        if (!tableBody) return
        // Table implementation can be added later if needed
    }

    // Show empty state
    const showEmptyState = () => {
        // Handle empty state if needed
    }

    // Reference getters
    const getMainContainer = (el) => {
        mainContainer = el
    }

    const getScrollContainer = (el) => {
        scrollContainer = el
    }

    // Create filter section
    const FilterSection = () => {
        return $({
            tag: 'div',
            style: {
                padding: '16px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            },
            child: [
                // Filter row
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    },
                    child: [
                        // Campus filter
                        createFilterSelect('Campus', campusOptions, activeFilters.campus, filterByCampus),

                        // Center filter
                        createFilterSelect('Center', centerOptions, activeFilters.center, filterByCenter),

                    ]
                }),
                // Active filters display
                $({
                    tag: 'div',
                    att: { className: 'active-filters-container' },
                    style: {
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        minHeight: '28px'
                    }
                })
            ]
        })
    }

    // Create filter select component
    const createFilterSelect = (label, options, currentValue, onChange) => {
        const selectId = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`

        return $({
            tag: 'div',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            },
            child: [
                $({
                    tag: 'label',
                    att: { for: selectId },
                    text: `${label}:`,
                    style: {
                        color: '#888',
                        fontSize: '13px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }
                }),
                $({
                    tag: 'select',
                    att: { id: selectId },
                    style: {
                        backgroundColor: '#333',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        padding: '8px 32px 8px 12px',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '14px',
                        minWidth: '180px',
                        transition: 'all 0.2s ease'
                    },
                    child: options.map(opt =>
                        $({
                            tag: 'option',
                            att: { value: opt.value, selected: opt.value === currentValue },
                            text: opt.label
                        })
                    ),
                    event: {
                        type: 'change',
                        method: (e) => onChange(e.target.value),
                        type2: 'focus',
                        method2: (e) => {
                            e.target.style.borderColor = 'deepskyblue'
                            e.target.style.backgroundColor = '#3d3d3d'
                        },
                        type3: 'blur',
                        method3: (e) => {
                            e.target.style.borderColor = '#444'
                            e.target.style.backgroundColor = '#333'
                        }
                    }
                })
            ]
        })
    }

    // Create header section
    const HeaderSection = () => {
        return $({
            tag: 'div',
            style: {
                padding: '20px 24px',
                backgroundColor: '#2a2a2a',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, deepskyblue 0%, #0066cc 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-chart-pie' },
                                    style: { color: '#fff', fontSize: '18px' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'h2',
                                    text: 'Summary of Accomplishment',
                                    style: {
                                        color: '#fff',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        margin: '0',
                                        lineHeight: '1.3'
                                    }
                                }),
                                $({
                                    tag: 'p',
                                    text: 'Research and Development Accomplishment Overview',
                                    style: {
                                        color: '#888',
                                        fontSize: '13px',
                                        margin: '2px 0 0 0'
                                    }
                                })
                            ]
                        })
                    ]
                }),
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '10px'
                    },
                    child: [
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#aaa',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-download' },
                                    style: { fontSize: '12px' }
                                }),
                                $({ tag: 'span', text: 'Export Report' })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    // TODO: Implement export functionality
                                    console.log('Export report clicked')
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.target.style.backgroundColor = '#333'
                                    e.target.style.borderColor = '#666'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.borderColor = '#444'
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            style: {
                                padding: '8px 16px',
                                backgroundColor: 'deepskyblue',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    att: { className: 'fa-solid fa-rotate' },
                                    style: { fontSize: '12px' }
                                }),
                                $({ tag: 'span', text: 'Refresh Data' })
                            ],
                            event: {
                                type: 'click',
                                method: () => {
                                    fetchSummaryData()
                                },
                                type2: 'mouseenter',
                                method2: (e) => {
                                    e.target.style.backgroundColor = '#00a6d1'
                                    e.target.style.transform = 'translateY(-1px)'
                                },
                                type3: 'mouseleave',
                                method3: (e) => {
                                    e.target.style.backgroundColor = 'deepskyblue'
                                    e.target.style.transform = 'translateY(0)'
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

    // Create stats grid
    const StatsGrid = () => {
        return $({
            tag: 'div',
            style: {
                padding: '24px',
                overflow: 'auto',
                flex: '1'
            },
            child: [
                $({
                    tag: 'div',
                    att: { className: 'summary-stats-container' },
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px'
                    }
                })
            ]
        })
    }

    // Initialize and fetch data
    const initialize = () => {
        // Fetch initial data
        fetchSummaryData()
    }

    // Return main container
    const summaryContainer = $({
        tag: 'div',
        att: { className: 'summary-accomplishment-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        },
        externalStyle: '/client/component/rdeStaff/style/summaryAccomplishment.css',
        elementHandler: getMainContainer,
        child: [
            HeaderSection(),
            FilterSection(),
            StatsGrid()
        ]
    })

    // Initialize after DOM is ready
    setTimeout(initialize, 100)

    return summaryContainer
}

// Export utility functions
export const getSummaryStats = (data) => {
    return {
        ongoingResearch: data.filter(item => item.status === 'ongoing').length,
        completedResearch: data.filter(item => item.status === 'completed').length,
        conductedResearch: data.filter(item => item.type === 'training').length,
        facultyPresentation: data.filter(item => item.type === 'presentation').length,
        facultyTraining: data.filter(item => item.type === 'faculty_training').length,
        igpProjects: data.filter(item => item.type === 'igp').length,
        exhibits: data.filter(item => item.type === 'exhibit').length,
        facilities: data.filter(item => item.type === 'facility').length,
        publications: data.filter(item => item.type === 'publication').length,
        citations: data.filter(item => item.type === 'citation').length
    }
}

export const formatSummaryDate = (date) => {
    if (!date) return '—'
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}