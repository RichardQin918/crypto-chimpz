import gsap from 'gsap'
import ScrollToPlugin from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin)
export default (el) => {
    gsap.to(window, {
        duration: .5,
        scrollTo: {
            y: el,
            offsetY: 150
        }
    })
}
