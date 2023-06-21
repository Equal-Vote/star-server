export function scrollToElement(e){
    setTimeout(() => {
        // TODO: I feel like there's got to be an easier way to do this
        let openedSection = (typeof e === 'function')? e() : e;

        if(NodeList.prototype.isPrototypeOf(openedSection)){
            // NOTE: NodeList could contain a bunch of hidden elements with height 0, so we're filtering those out
            openedSection = Array.from(openedSection).filter((e) => {
                const box = e.getBoundingClientRect();
                return (box.bottom - box.top) > 0;
            })
            if(openedSection.length == 0) return;
            openedSection = openedSection[0];
        }

        const navBox = document.querySelector('header').getBoundingClientRect();
        const navHeight = navBox.bottom - navBox.top;

        const elemTop = document.documentElement.scrollTop + openedSection.getBoundingClientRect().top - 30;
        const elemBottom = elemTop + openedSection.scrollHeight;
        const windowTop = document.documentElement.scrollTop;
        const windowBottom = windowTop + window.innerHeight;

        if(elemTop < windowTop || elemBottom > windowBottom){
            window.scrollTo({
                top: elemTop - navHeight,
                behavior: 'smooth'   
            });
        }
    }, 250);
}