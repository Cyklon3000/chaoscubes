import '/chaoscubes/styles/footer.scss';

const footer = document.getElementById('footer');
setTimeout(makeFooterVisible, 250);
function makeFooterVisible()
{
    footer.style.display = "flex";
}

let lastFooterInteraction = null;
let removeFooter = false;
let isHovering = false;

// Listen for the mouseenter and mouseleave events on the #footer element
footer.addEventListener('mouseenter', () =>
{
    isHovering = true;
});
footer.addEventListener('mouseleave', () =>
{
    isHovering = false;
});

// Trigger footerInteraction() when scrolled (mobile and mouse)
document.addEventListener('touchmove', function (event)
{
    event.preventDefault();
    footerInteraction();
});
document.addEventListener('wheel', function (event)
{
    event.preventDefault();
    footerInteraction();
});

// Start setFooterPosition() or update lastFooterInteraction
function footerInteraction()
{
    if (lastFooterInteraction === null)
    {
        setFooterPosition().then(() =>
        {
            lastFooterInteraction = null;
            removeFooter = false;
        });
    } else
    {
        lastFooterInteraction = new Date().getTime();
    }
}

// Set footer position to be visible, then wait 5 seconds until hiding it again, reset timer if user hovers
function setFooterPosition()
{
    lastFooterInteraction = new Date().getTime();
    return new Promise((resolve) =>
    {
        const step = () =>
        {
            const timeSinceLastInteraction = new Date().getTime() - lastFooterInteraction;
            if (isHovering)
            {
                lastFooterInteraction = new Date().getTime();
            }
            if (timeSinceLastInteraction > 5000)
            {
                removeFooter = true;
            }
            if (removeFooter)
            {
                footer.style.transform = '';
                resolve();
            } else
            {
                footer.style.transform = `translateY(0px)`;
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    });
}
