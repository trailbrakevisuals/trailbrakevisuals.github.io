(function () {

    const lightbox = document.createElement("div");

    lightbox.className = "lightbox";

    lightbox.innerHTML = `
        <button
            class="lightbox-close"
            aria-label="Close photo">
            ×
        </button>

        <img
            class="lightbox-image"
            src=""
            alt="">

        <div class="lightbox-details">

            <h3 class="lightbox-title"></h3>

            <p class="lightbox-meta"></p>

        </div>
    `;

    document.body.appendChild(lightbox);

    const image = lightbox.querySelector(".lightbox-image");
    const title = lightbox.querySelector(".lightbox-title");
    const meta = lightbox.querySelector(".lightbox-meta");
    const closeButton = lightbox.querySelector(".lightbox-close");

    function openViewer(photo) {

        image.src = photo.src;

        image.alt = photo.alt || "";

        title.textContent =
            photo.title || "Trailbrake Visuals";

        const details = [];

        if (photo.number) {
            details.push(`#${photo.number}`);
        }

        if (photo.team) {
            details.push(photo.team);
        }

        if (photo.car) {
            details.push(photo.car);
        }

        if (photo.className) {
            details.push(photo.className);
        }

        if (photo.event) {
            details.push(photo.event);
        }

        meta.textContent = details.join("  •  ");

        lightbox.classList.add("open");

        document.body.style.overflow = "hidden";
    }

    function closeViewer() {

        lightbox.classList.remove("open");

        document.body.style.overflow = "";

        image.src = "";
    }

    closeButton.addEventListener(
        "click",
        closeViewer
    );

    lightbox.addEventListener(
        "click",
        function (event) {

            if (event.target === lightbox) {
                closeViewer();
            }

        }
    );

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeViewer();
            }

        }
    );

    window.TrailbrakeViewer = {
        open: openViewer,
        close: closeViewer
    };

})();
