import { $, Waiting } from "../../../lib/lib.js";
import { onGoingResearch } from "./accomplishmentReport/onGoingRes.js";
import { completedResearch } from "./accomplishmentReport/completedRes.js";
import { conductedResearch } from "./accomplishmentReport/conductedRes.js";
import { trainingsAttended } from "./accomplishmentReport/trainingAttendedRes.js";
import { igpResearch } from "./accomplishmentReport/igpRes.js";
import { participationResearch } from "./accomplishmentReport/participationRes.js";
import { facilitiesImprovement } from "./accomplishmentReport/facilitiesImprovement.js";
import { facultyPresentation } from "./accomplishmentReport/presentationsRes.js";
import { publicationResearch } from "./accomplishmentReport/publicationRes.js";
import { citationsResearch } from "./accomplishmentReport/citationsRes.js";
import { PatentUM } from "./accomplishmentReport/ipAssets.js";

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
            key: 'trainingsAttended',
            label: 'Faculty Research Training Attended',
            icon: 'fa-user-graduate',
            color: '#00bcd4',
            gradient: 'linear-gradient(135deg, #00bcd4 0%, #00838f 100%)'
        },
        {
            key: 'igpResearch',
            label: 'IGP Research Projects',
            icon: 'fa-project-diagram',
            color: '#ff5722',
            gradient: 'linear-gradient(135deg, #ff5722 0%, #bf360c 100%)'
        },
        {
            key: 'participationResearch',
            label: 'Participation to Exhibits',
            icon: 'fa-flag',
            color: '#795548',
            gradient: 'linear-gradient(135deg, #795548 0%, #4e342e 100%)'
        },
        {
            key: 'facilitiesImprovement',
            label: 'Facilities Improvement',
            icon: 'fa-building',
            color: '#607d8b',
            gradient: 'linear-gradient(135deg, #607d8b 0%, #37474f 100%)'
        },
        {
            key: 'facultyPresentation',
            label: 'Faculty Presentations',
            icon: 'fa-video',
            color: '#9c27b0',
            gradient: 'linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)'
        },
        {
            key: 'publicationResearch',
            label: 'Publications',
            icon: 'fa-book',
            color: '#e91e63',
            gradient: 'linear-gradient(135deg, #e91e63 0%, #880e4f 100%)'
        },
        {
            key: 'citationsResearch',
            label: 'Research Citations',
            icon: 'fa-quote-right',
            color: '#3f51b5',
            gradient: 'linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)'
        },
        {
            key: 'ipAssets',
            label: 'IP Assets',
            icon: 'fa-shield-alt',
            color: '#f44336',
            gradient: 'linear-gradient(135deg, #f44336 0%, #b71c1c 100%)'
        }

    ]

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

    const showLoading = () => {
        if (!loadingElement) {
            loadingElement = Waiting()
            document.body.appendChild(loadingElement)
        }
    }

    const hideLoading = () => {
        if (loadingElement) {
            loadingElement.remove()
            loadingElement = null
        }
    }

    const fetchSummaryData = async () => {
        if (isLoading) return

        isLoading = true
        showLoading()

        try {
            // Fetch main summary data from /monitor
            const formData = new FormData()
            formData.append('action', 'fetch')

            const response = await fetch('/monitor', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            // Fetch both training counts in a single call
            let trainingConductedCount = 0
            let trainingAttendedCount = 0
            
            try {
                const bothCountsFormData = new FormData()
                bothCountsFormData.append('action', 'bothCounts')

                // Apply current filters
                if (activeFilters.campus !== 'all') {
                    bothCountsFormData.append('type', 'campus')
                    bothCountsFormData.append('location', activeFilters.campus)
                } else if (activeFilters.center !== 'all') {
                    bothCountsFormData.append('type', 'center')
                    bothCountsFormData.append('location', activeFilters.center)
                } else {
                    bothCountsFormData.append('type', 'All')
                }

                const bothCountsResponse = await fetch('/summaryAccomplish', {
                    method: 'POST',
                    body: bothCountsFormData
                })

                const bothCountsResult = await bothCountsResponse.json()

                if (bothCountsResult.status && bothCountsResult.data) {
                    trainingConductedCount = bothCountsResult.data.conducted || 0
                    trainingAttendedCount = bothCountsResult.data.attended || 0
                    console.log('Training counts:', {
                        conducted: trainingConductedCount,
                        attended: trainingAttendedCount,
                        filters: activeFilters
                    })
                }
            } catch (countsError) {
                console.error('Error fetching training counts:', countsError)
            }

            if (result.success && result.summary) {
                const stats = {}
                statsCards.forEach(card => { stats[card.key] = 0 })
                
                stats.ongoingResearch = result.summary.totalOngoing ?? 0
                stats.completedResearch = result.summary.completed ?? 0
                stats.conductedResearch = trainingConductedCount
                stats.trainingsAttended = trainingAttendedCount
                stats.igpResearch = result.summary.igpResearch ?? 0
                stats.participationResearch = result.summary.participationResearch ?? 0
                stats.facilitiesImprovement = result.summary.facilitiesImprovement ?? 0
                stats.facultyPresentation = result.summary.facultyPresentation ?? 0
                stats.publicationResearch = result.summary.publicationResearch ?? 0
                stats.citationsResearch = result.summary.citationsResearch ?? 0
                stats.ipAssets = result.summary.ipAssets ?? 0
                
                updateStatsCards(stats)
            } else {
                const zeroStats = {}
                statsCards.forEach(card => {
                    if (card.key === 'conductedResearch') {
                        zeroStats[card.key] = trainingConductedCount
                    } else if (card.key === 'trainingsAttended') {
                        zeroStats[card.key] = trainingAttendedCount
                    } else {
                        zeroStats[card.key] = 0
                    }
                })
                updateStatsCards(zeroStats)
            }
        } catch (error) {
            console.error('Error fetching summary data:', error)
            const zeroStats = {}
            statsCards.forEach(card => { zeroStats[card.key] = 0 })
            updateStatsCards(zeroStats)
        } finally {
            isLoading = false
            hideLoading()
        }
    }

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
            //completedResearch component
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
            //conductedResearch component
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
        if (stat.key === 'trainingsAttended') {
            //trainingsAttended component
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
                                    const trainingAttendedComponent = trainingsAttended()
                                    if (trainingAttendedComponent) {
                                        el.appendChild(trainingAttendedComponent)
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
        if (stat.key === 'igpResearch') {
            //igpResearch component
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
                                    const igpResearchComponent = igpResearch()
                                    if (igpResearchComponent) {
                                        el.appendChild(igpResearchComponent)
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
        if (stat.key === 'participationResearch') {
            //participation research component
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
                                    const participationResComponent = participationResearch()
                                    if (participationResComponent) {
                                        el.appendChild(participationResComponent)
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
        if (stat.key === 'facilitiesImprovement') {
            //facilities improvement component
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
                                    const facilitiesImprovementComponent = facilitiesImprovement()
                                    if (facilitiesImprovementComponent) {
                                        el.appendChild(facilitiesImprovementComponent)
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
        if (stat.key === 'facultyPresentation') {
            //faculty presentation component
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
                                    const facultyPresentationComponent = facultyPresentation()
                                    if (facultyPresentationComponent) {
                                        el.appendChild(facultyPresentationComponent)
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
        if (stat.key === 'publicationResearch') {
            //faculty presentation component
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
                                    const publicationResearchComponent = publicationResearch()
                                    if (publicationResearchComponent) {
                                        el.appendChild(publicationResearchComponent)
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
        if (stat.key === 'citationsResearch') {
            //faculty presentation component
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
                                    const citationsResearchComponent = citationsResearch()
                                    if (citationsResearchComponent) {
                                        el.appendChild(citationsResearchComponent)
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
        if (stat.key === 'ipAssets') {
            //faculty presentation component
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
                                    const ipAssetsComponent = PatentUM()
                                    if (ipAssetsComponent) {
                                        el.appendChild(ipAssetsComponent)
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

    const getModalContent = (stat) => {
        return $({
            tag: 'div',
            att: { className: 'summary-modal-box' },
            style: {
                backgroundColor: '#ffffff',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '85vh',
                borderRadius: '16px',
                border: '1px solid #e9ecef',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
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
                        padding: '24px 28px',
                        borderBottom: `2px solid ${stat.color}25`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: `linear-gradient(135deg, ${stat.color}06 0%, transparent 100%)`,
                        borderRadius: '16px 16px 0 0'
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
                                        backgroundColor: `${stat.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1px solid ${stat.color}20`
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
                                        color: '#212529',
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
                                color: '#6c757d',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '8px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: closeModal
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#f8f9fa'
                                    e.target.style.color = '#212529'
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = '#6c757d'
                                }
                            }
                        })
                    ]
                }),
                // Modal body
                $({
                    tag: 'div',
                    style: {
                        padding: '28px',
                        overflow: 'auto',
                        flex: '1',
                        backgroundColor: '#fafbfc'
                    },
                    child: [
                        // Content
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
                                        fontSize: '56px',
                                        color: stat.color,
                                        marginBottom: '20px',
                                        opacity: '0.3'
                                    }
                                }),
                                $({
                                    tag: 'p',
                                    text: `Detailed view for "${stat.label}" will be implemented here.`,
                                    style: {
                                        color: '#495057',
                                        fontSize: '16px',
                                        lineHeight: '1.6',
                                        marginBottom: '10px',
                                        maxWidth: '500px'
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
                        padding: '16px 28px',
                        borderTop: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        backgroundColor: '#ffffff',
                        borderRadius: '0 0 16px 16px'
                    },
                    child: [
                        $({
                            tag: 'button',
                            text: 'Close',
                            style: {
                                padding: '10px 24px',
                                backgroundColor: 'transparent',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                color: '#495057',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            },
                            event: {
                                type: 'click',
                                method: closeModal
                            },
                            event2: {
                                type: 'mouseenter',
                                method: (e) => {
                                    e.target.style.backgroundColor = '#f8f9fa'
                                    e.target.style.borderColor = '#0d6efd'
                                    e.target.style.color = '#212529'
                                }
                            },
                            event3: {
                                type: 'mouseleave',
                                method: (e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.borderColor = '#dee2e6'
                                    e.target.style.color = '#495057'
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

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


    const applyFilters = () => {
        updateFilterBadges()
        fetchSummaryData()
    }

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

    const filterByCampus = (campus) => {
        activeFilters.campus = campus
        applyFilters()
    }

    const filterByCenter = (center) => {
        activeFilters.center = center
        applyFilters()
    }

    const updateTableWithData = () => {
        if (!tableBody) return
    }

    const showEmptyState = () => {
    }

    const getMainContainer = (el) => {
        mainContainer = el
    }

    const FilterSection = () => {
        return $({
            tag: 'div',
            att: { className: 'summary-filter-section' },
            style: {
                padding: '16px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            },
            child: [
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    },
                    child: [
                        createFilterSelect('Campus', campusOptions, activeFilters.campus, filterByCampus),
                        createFilterSelect('Center', centerOptions, activeFilters.center, filterByCenter),
                    ]
                }),
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
                        color: '#495057',
                        fontSize: '13px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }
                }),
                $({
                    tag: 'select',
                    att: { id: selectId },
                    style: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '8px 32px 8px 12px',
                        color: '#212529',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23495057\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '14px',
                        minWidth: '180px',
                        transition: 'all 0.2s ease'
                    },
                    child: options.map(opt =>
                        $({
                            tag: 'option',
                            att: { 
                                value: opt.value, 
                                selected: opt.value === currentValue 
                            },
                            text: opt.label,
                            style: {
                                backgroundColor: '#ffffff',
                                color: '#212529',
                                padding: '8px'
                            }
                        })
                    ),
                    event: {
                        type: 'change',
                        method: (e) => onChange(e.target.value)
                    },
                    event2: {
                        type: 'focus',
                        method: (e) => {
                            e.target.style.borderColor = '#0d6efd'
                            e.target.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.1)'
                            e.target.style.backgroundColor = '#ffffff'
                        }
                    },
                    event3: {
                        type: 'blur',
                        method: (e) => {
                            e.target.style.borderColor = '#dee2e6'
                            e.target.style.boxShadow = 'none'
                            e.target.style.backgroundColor = '#ffffff'
                        }
                    }
                })
            ]
        })
    }

    const HeaderSection = () => {
        return $({
            tag: 'div',
            att: { className: 'summary-header-section' },
            style: {
                padding: '20px 24px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
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
                                background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
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
                                        color: '#212529',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        margin: '0',
                                        lineHeight: '1.3'
                                    }
                                }),
                                $({
                                    tag: 'p',
                                    text: 'Research, Development and Extension Accomplishment Overview',
                                    style: {
                                        color: '#6c757d',
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
                            att: { className: 'summary-export-btn' },
                            style: {
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                color: '#495057',
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
                                    console.log('Export report clicked')
                                }
                            }
                        }),
                        $({
                            tag: 'button',
                            att: { className: 'summary-refresh-btn' },
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#0d6efd',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#ffffff',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(13, 110, 253, 0.3)'
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
                                }
                            }
                        })
                    ]
                })
            ]
        })
    }

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

    const initialize = () => {
        fetchSummaryData()
    }

    const summaryContainer = $({
        tag: 'div',
        att: { className: 'summary-accomplishment-container' },
        style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
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

    setTimeout(initialize, 100)

    return summaryContainer
}

export const getSummaryStats = (data) => {
    return {
        ongoingResearch: data.filter(item => item.status === 'ongoing').length,
        completedResearch: data.filter(item => item.status === 'completed').length,
        conductedResearch: data.filter(item => item.type === 'training').length,
        facultyPresentation: data.filter(item => item.type === 'presentation').length,
        trainingsAttended: data.filter(item => item.type === 'faculty_training').length,
        igpResearch: data.filter(item => item.type === 'igp').length,
        participationResearch: data.filter(item => item.type === 'exhibit').length,
        facilitiesImprovement: data.filter(item => item.type === 'facility').length,
        publicationResearch: data.filter(item => item.type === 'publication').length,
        citationsResearch: data.filter(item => item.type === 'citation').length,
        ipAssets: data.filter(item => item.type === 'ipassets').length
    }
}

export const formatSummaryDate = (date) => {
    if (!date) return '—'
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}