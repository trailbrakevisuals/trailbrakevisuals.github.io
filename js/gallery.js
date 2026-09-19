(function () {

    const REPO_API =
        "https://api.github.com/repos/trailbrakevisuals/trailbrakevisuals.github.io/contents/assets/photos?ref=main";

    const PHOTO_BASE =
        "https://trailbrakevisuals.github.io/assets/photos/";

    const metadata =
        window.TrailbrakeMetadata || {
            photos: {}
        };


    /*
     * LOAD PHOTOS
     */

    async function loadPhotos() {

        try {

            const response =
                await fetch(REPO_API);

            if (!response.ok) {
                throw new Error(
                    "Unable to load photo collection."
                );
            }

            const files =
                await response.json();

            const photos =
                files
                    .filter(file => {

                        return (
                            file.type === "file" &&
                            /\.(jpg|jpeg|png|webp)$/i.test(
                                file.name
                            )
                        );

                    })
                    .sort((a, b) => {

                        return a.name.localeCompare(
                            b.name,
                            undefined,
                            {
                                numeric: true,
                                sensitivity: "base"
                            }
                        );

                    })
                    .map(file => {

                        const data =
                            metadata.photos[file.name] || {};

                        return {

                            filename:
                                file.name,

                            src:
                                PHOTO_BASE +
                                encodeURIComponent(
                                    file.name
                                ),

                            title:
                                data.title ||
                                "Trailbrake Visuals",

                            alt:
                                data.alt ||
                                "Motorsport photography by Trailbrake Visuals",

                            number:
                                data.number || "",

                            team:
                                data.team || "",

                            car:
                                data.car || "",

                            className:
                                data.className || "",

                            event:
                                data.event ||
                                "NLS8&9",

                            quality:
                                typeof data.quality === "number"
                                    ? data.quality
                                    : 0,

                            featured:
                                data.featured === true

                        };

                    });

            return photos;

        } catch (error) {

            console.error(
                "Trailbrake photo loading error:",
                error
            );

            return [];

        }

    }


    /*
     * SHUFFLE
     *
     * Used only for homepage featured photography.
     * The main Work gallery keeps its normal order.
     */

    function shuffle(array) {

        return [...array]
            .sort(() => Math.random() - 0.5);

    }


    /*
     * FEATURED IMAGE SELECTION
     */

    function getFeaturedPhotos(photos) {

        const manual =
            photos.filter(
                photo => photo.featured
            );

        const pool =
            manual.length >= 4
                ? manual
                : photos;

        return shuffle(pool).slice(0, 4);

    }


    /*
     * HERO
     */

    function renderHero(photos) {

        const container =
            document.getElementById(
                "hero-image"
            );

        if (
            !container ||
            !photos.length
        ) {
            return;
        }

        const selected =
            getFeaturedPhotos(photos)[0];

        if (!selected) {
            return;
        }

        container.innerHTML = "";

        const image =
            document.createElement("img");

        image.src =
            selected.src;

        image.alt =
            selected.alt;

        image.loading =
            "eager";

        container.appendChild(
            image
        );

    }


    /*
     * FEATURED GRID
     */

    function renderFeatured(photos) {

        const container =
            document.getElementById(
                "featured-grid"
            );

        if (!container) {
            return;
        }

        const featured =
            getFeaturedPhotos(photos);

        container.innerHTML = "";

        featured.forEach(
            (photo, index) => {

                const item =
                    document.createElement(
                        "article"
                    );

                item.className =
                    "featured-item";

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    photo.src;

                image.alt =
                    photo.alt;

                image.loading =
                    index < 2
                        ? "eager"
                        : "lazy";


                const overlay =
                    document.createElement(
                        "div"
                    );

                overlay.className =
                    "featured-overlay";


                const label =
                    document.createElement(
                        "div"
                    );

                label.className =
                    "featured-label";

                label.textContent =
                    "NLS 8 & 9";


                const title =
                    document.createElement(
                        "div"
                    );

                title.className =
                    "featured-title";

                title.textContent =
                    photo.title ||
                    "Selected frame";


                overlay.appendChild(
                    label
                );

                overlay.appendChild(
                    title
                );

                item.appendChild(
                    image
                );

                item.appendChild(
                    overlay
                );


                item.addEventListener(
                    "click",
                    function () {

                        if (
                            window.TrailbrakeViewer
                        ) {

                            window.TrailbrakeViewer.open(
                                photo
                            );

                        }

                    }
                );


                container.appendChild(
                    item
                );

            }
        );

    }


    /*
     * WORK PAGE GALLERY
     */

    function renderGallery(photos) {

        const container =
            document.getElementById(
                "gallery"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        photos.forEach(
            photo => {

                const item =
                    document.createElement(
                        "article"
                    );

                item.className =
                    "gallery-item";


                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    photo.src;

                image.alt =
                    photo.alt;

                image.loading =
                    "lazy";


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "gallery-item-info";


                const title =
                    document.createElement(
                        "strong"
                    );

                title.textContent =
                    photo.title ||
                    "Trailbrake Visuals";


                const details =
                    document.createElement(
                        "span"
                    );

                const detailParts = [];


                if (photo.number) {

                    detailParts.push(
                        `#${photo.number}`
                    );

                }

                if (photo.team) {

                    detailParts.push(
                        photo.team
                    );

                }

                if (photo.car) {

                    detailParts.push(
                        photo.car
                    );

                }

                if (photo.event) {

                    detailParts.push(
                        photo.event
                    );

                }


                details.textContent =
                    detailParts.join(
                        " • "
                    );


                info.appendChild(
                    title
                );

                info.appendChild(
                    details
                );

                item.appendChild(
                    image
                );

                item.appendChild(
                    info
                );


                item.addEventListener(
                    "click",
                    function () {

                        if (
                            window.TrailbrakeViewer
                        ) {

                            window.TrailbrakeViewer.open(
                                photo
                            );

                        }

                    }
                );


                container.appendChild(
                    item
                );

            }
        );

    }


    /*
     * ABOUT PHOTO
     */

    function renderAboutPhoto(photos) {

        const container =
            document.getElementById(
                "about-preview-photo"
            );

        if (
            !container ||
            !photos.length
        ) {
            return;
        }

        const selected =
            getFeaturedPhotos(photos)[1] ||
            photos[0];

        container.innerHTML = "";

        const image =
            document.createElement(
                "img"
            );

        image.src =
            selected.src;

        image.alt =
            selected.alt;

        image.loading =
            "lazy";

        container.appendChild(
            image
        );

    }


    /*
     * EVENT IMAGE
     */

    function renderEventImage(photos) {

        const container =
            document.querySelector(
                ".event-card-background"
            );

        if (
            !container ||
            !photos.length
        ) {
            return;
        }

        const selected =
            getFeaturedPhotos(photos)[2] ||
            photos[0];

        container.innerHTML = "";

        const image =
            document.createElement(
                "img"
            );

        image.src =
            selected.src;

        image.alt =
            selected.alt;

        image.loading =
            "lazy";

        container.appendChild(
            image
        );

    }


    /*
     * FILTERS
     */

    function setupFilters(photos) {

        const buttons =
            document.querySelectorAll(
                ".filter-button"
            );

        if (!buttons.length) {
            return;
        }

        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        buttons.forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                        button.classList.add(
                            "active"
                        );


                        const filter =
                            button.dataset.filter ||
                            "all";


                        let filtered =
                            photos;


                        if (
                            filter !== "all"
                        ) {

                            filtered =
                                photos.filter(
                                    photo =>
                                        photo.event ===
                                        filter
                                );

                        }


                        renderGallery(
                            filtered
                        );

                    }
                );

            }
        );

    }


    /*
     * MOBILE MENU
     */

    function setupMobileMenu() {

        const button =
            document.querySelector(
                ".mobile-menu-button"
            );

        const header =
            document.querySelector(
                ".site-header"
            );

        const menu =
            document.querySelector(
                ".mobile-menu"
            );

        if (
            !button ||
            !header
        ) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                header.classList.toggle(
                    "mobile-open"
                );

                if (menu) {

                    menu.classList.toggle(
                        "open"
                    );

                }


                const isOpen =
                    header.classList.contains(
                        "mobile-open"
                    );


                button.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );


        if (menu) {

            menu.querySelectorAll("a")
                .forEach(
                    link => {

                        link.addEventListener(
                            "click",
                            function () {

                                header.classList.remove(
                                    "mobile-open"
                                );

                                menu.classList.remove(
                                    "open"
                                );

                                button.setAttribute(
                                    "aria-expanded",
                                    "false"
                                );

                            }
                        );

                    }
                );

        }

    }


    /*
     * CURRENT YEAR
     */

    function setYear() {

        document
            .querySelectorAll(
                "[data-current-year]"
            )
            .forEach(
                element => {

                    element.textContent =
                        new Date()
                            .getFullYear();

                }
            );

    }


    /*
     * INITIALISE
     */

    async function init() {

        setupMobileMenu();

        setYear();


        const photos =
            await loadPhotos();


        if (!photos.length) {

            console.warn(
                "No Trailbrake photos found."
            );

            return;

        }


        renderHero(
            photos
        );

        renderFeatured(
            photos
        );

        renderGallery(
            photos
        );

        renderAboutPhoto(
            photos
        );

        renderEventImage(
            photos
        );

        setupFilters(
            photos
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();
