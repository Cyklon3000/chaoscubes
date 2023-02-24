// title content get saved and deleted, for later animation
const title = document.getElementById("title");
const text = title.innerHTML;
title.innerHTML = null;

// buffer element with the same dith as the former title
const buffer = document.getElementById("buffer");
buffer.style.width = text.length + "ch";
// buffer.innerHTML = text;

let index = 0;
function typeEffect()
{
    if (index < text.length)
    {
        // Inster char after char into title element
        title.innerHTML += text.charAt(index);
        // Decrease width of buffer, cause the title element gets bigger
        buffer.style.width = (text.length - (index + 1)) + "ch";
        // buffer.innerHTML = text.substring(index + 1, text.length);

        index++;
        setTimeout(typeEffect, Math.random() * 50 + 25);
    }
}

setTimeout(typeEffect, 500);