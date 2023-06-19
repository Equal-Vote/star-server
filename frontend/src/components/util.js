export function scrollToElement(e){
    setTimeout(() => {
        // TODO: I feel like there's got to be an easier way to do this
        const openedSection = (typeof e === 'function')? e() : e;

        const navBox = document.querySelector('header').getBoundingClientRect();
        const navHeight = navBox.bottom - navBox.top;

        const elemTop = document.documentElement.scrollTop + openedSection.getBoundingClientRect().top;
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