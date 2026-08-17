import { $ } from '../../lib/lib.js'
import { Navbar } from './navBar.js'
import { HeroSection } from './heroSection.js'
import { VpMessage } from './vpMessage.js'
import { HappeningEvents } from './happeningEvents.js'
import { UpcomingEvents } from './upcomingEvents.js'
import { NewsSection } from './newsSection.js'
import { ProjectMap } from './projectMap.js'
import { RdeRoadmap } from './rdeRoadmap.js'
import { RdeCenters } from './rdeCenters.js'
import { ContactUs } from './contactUs.js'
import { Footer } from './footer.js'

// 1. Import the animator
import { initScrollAnimations } from './scrollAnimator.js'

export const LandingPage = () => {
    // 2. Initialize animations after the page renders
    setTimeout(initScrollAnimations, 300);

    return $({
        tag: 'div',
        style: { width: '100%', overflow: 'hidden' },
        externalStyle: '/client/component/landingComponent/style/styles.css',
        child: [
            Navbar(),
            HeroSection(),
            VpMessage(),
            HappeningEvents(),
            UpcomingEvents(),
            NewsSection(),
            ProjectMap(),
            RdeRoadmap(),
            RdeCenters(),
            ContactUs(),
            Footer()
        ]
    })
}