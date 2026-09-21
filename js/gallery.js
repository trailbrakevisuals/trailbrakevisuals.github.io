(function () {

    /*
     * =====================================================
     * PHOTO COLLECTIONS
     * =====================================================
     */

    const PHOTO_COLLECTIONS = [

        {
            event: "NLS8&9",

            api:
                "https://api.github.com/repos/trailbrakevisuals/trailbrakevisuals.github.io/contents/assets/photos?ref=main",

            base:
                "https://trailbrakevisuals.github.io/assets/photos/",

            metadata:
                "https://api.github.com/repos/trailbrakevisuals/trailbrakevisuals.github.io/contents/assets/photos/metadata.json?ref=main"
        },

        {
            event: "Ultimate cup series EU",

            api:
                "https://api.github.com/repos/trailbrakevisuals/trailbrakevisuals.github.io/contents/assets/ultimate-cup-series-eu?ref=main",

            base:
                "https://trailbrakevisuals.github.io/assets/ultimate-cup-series-eu/",

            metadata:
                "https://api.github.com/repos/trailbrakevisuals/trailbrakevisuals.github.io/contents/assets/ultimate-cup-series-eu/metadata.json?ref=main"
        }

    ];


    const globalMetadata =
        window.TrailbrakeMetadata || {
            photos: {}
        };


    /*
     * =====================================================
     * LOAD EVENT METADATA
     * =====================================================
     */

    async function loadEventMetadata(collection) {

        try {

            const response =
                await fetch(collection.metadata);

            if (!response.ok) {

                return {
                    photos: {}
                };

            }

            const data =
                await response.json();

            return data || {
                photos: {}
            };

        } catch (error) {

            console.warn(
                "Unable to load metadata for:",
                collection.event
            );

            return {
                photos: {}
            };

        }

    }


    /*
     * =====================================================
     * LOAD ONE PHOTO COLLECTION
     * =====================================================
     */

    async function loadCollection(collection) {

        try {

            const response =
                await fetch(collection.api);

            if (!response.ok) {

                throw new Error(
                    "Unable to load photo collection."
                );

            }

            const files =
                await response.json();


            const eventMetadata =
                await loadEventMetadata(
                    collection
                );


            const photos =
                files

                    .filter(function (file) {

                        return (
                            file.type === "file" &&
                            /\.(jpg|jpeg|png|webp)$/i.test(
                                file.name
                            )
                        );

                    })


                    /*
                     * Keep natural filename order.
                     */

                    .sort(function (a, b) {

                        return a.name.localeCompare(
                            b.name,
                            undefined,
                            {
                                numeric: true,
                                sensitivity: "base"
                            }
                        );

                    })


                    .map(function (file) {

                        const globalData =
                            globalMetadata.photos &&
                            globalMetadata.photos[file.name]
                                ? globalMetadata.photos[file.name]
                                : {};


                        const eventData =
                            eventMetadata.photos &&
                            eventMetadata.photos[file.name]
                                ? eventMetadata.photos[file.name]
                                : {};


                        const data = {
                            ...globalData,
                            ...eventData
                        };


                        return {

                            filename:
                                file.name,

                            src:
                                collection.base +
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
                                data.number ||
                                "",

                            team:
                                data.team ||
                                "",

                            car:
                                data.car ||
                                "",

                            className:
                                data.className ||
                                "",

                            event:
                                data.event ||
                                collection.event,

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
                collection.event,
                error
            );

            return [];

        }

    }


    /*
     * =====================================================
     * LOAD ALL PHOTO COLLECTIONS
     * =====================================================
     */

    async function loadPhotos() {

        const collections =
            await Promise.all(
                PHOTO_COLLECTIONS.map(
                    loadCollection
                )
            );


        return collections.flat();

    }


    /*
     * =====================================================
     * SHUFFLE
     * =====================================================
     */

    function shuffle(array) {

        const shuffled =
            [...array];


        for (
            let i = shuffled.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );


            [
                shuffled[i],
                shuffled[j]
            ] = [
                shuffled[j],
                shuffled[i]
            ];

        }


        return shuffled;

    }


    /*
     * =====================================================
     * GET FEATURED PHOTOS
     *
     * The selected four photos are stored for
     * the current page load.
     *
     * The previous selection is stored in
     * localStorage so a reload avoids immediately
     * showing the same four photographs again.
     * =====================================================
     */

    function getFeaturedPhotos(photos) {

        if (!photos.length) {

            return [];

        }


        const manual =
            photos.filter(function (photo) {

                return photo.featured === true;

            });


        const pool =
            manual.length >= 4
                ? manual
                : photos;


        let previous = [];


        try {

            previous =
                JSON.parse(
                    localStorage.getItem(
                        "trailbrakeFeaturedPhotos"
                    )
                ) || [];


        } catch (error) {

            previous = [];

        }


        const previousSet =
            new Set(previous);


        /*
         * First try to completely avoid
         * the previous homepage selection.
         */

        let fresh =
            pool.filter(function (photo) {

                return !previousSet.has(
                    photo.event +
                    "::" +
                    photo.filename
                );

            });


        /*
         * If at least four unused photographs
         * remain, use only those.
         */

        if (fresh.length >= 4) {

            fresh =
                shuffle(fresh);


        } else {

            /*
             * Not enough unused photos remain.
             *
             * Use every unused photo first,
             * then fill the remaining positions
             * from the rest of the collection.
             */

            fresh =
                shuffle(fresh);


            const usedNow =
                new Set(
                    fresh.map(function (photo) {

                        return (
                            photo.event +
                            "::" +
                            photo.filename
                        );

                    })
                );


            const remaining =
                pool.filter(function (photo) {

                    return !usedNow.has(
                        photo.event +
                        "::" +
                        photo.filename
                    );

                });


            fresh =
                fresh.concat(
                    shuffle(remaining)
                );

        }


        const selected =
            fresh.slice(0, 4);


        /*
         * Save this selection for the next reload.
         */

        try {

            localStorage.setItem(
                "trailbrakeFeaturedPhotos",
                JSON.stringify(
                    selected.map(function (photo) {

                        return (
                            photo.event +
                            "::" +
                            photo.filename
                        );

                    })
                )
            );


        } catch (error) {

            console.warn(
                "Unable to save featured photo history."
            );

        }


        return selected;

    }


    /*
     * =====================================================
     * HERO
     * =====================================================
     */

    function renderHero(photo) {

        const container =
            document.getElementById(
                "hero-image"
            );


        if (
            !container ||
            !photo
        ) {

            return;

        }


        container.innerHTML = "";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            photo.src;

        image.alt =
            photo.alt;

        image.loading =
            "eager";


        container.appendChild(
            image
        );

    }


    /*
     * =====================================================
     * FEATURED GRID
     * =====================================================
     */

    function renderFeatured(photos) {

        const container =
            document.getElementById(
                "featured-grid"
            );


        if (!container) {

            return;

        }


        container.innerHTML = "";


        photos.forEach(
            function (photo, index) {


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
                    photo.event;


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
     * =====================================================
     * WORK PAGE GALLERY
     * =====================================================
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
            function (photo) {


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


                const detailParts =
                    [];


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
     * =====================================================
     * ABOUT PREVIEW
     * =====================================================
     */

    function renderAboutPhoto(photo) {

        const container =
            document.getElementById(
                "about-preview-photo"
            );


        if (
            !container ||
            !photo
        ) {

            return;

        }


        container.innerHTML = "";


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


        container.appendChild(
            image
        );

    }


    /*
     * =====================================================
     * EVENT IMAGE
     * =====================================================
     */

    function renderEventImage(photo) {

        const container =
            document.querySelector(
                ".event-card-background"
            );


        if (
            !container ||
            !photo
        ) {

            return;

        }


        container.innerHTML = "";


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


        container.appendChild(
            image
        );

    }


    /*
     * =====================================================
     * FILTERS
     * =====================================================
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
            function (button) {


                button.addEventListener(
                    "click",
                    function () {


                        buttons.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
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
                                    function (photo) {

                                        return (
                                            photo.event ===
                                            filter
                                        );

                                    }
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
     * =====================================================
     * MOBILE MENU
     * =====================================================
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
                    function (link) {


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
     * =====================================================
     * CURRENT YEAR
     * =====================================================
     */

    function setYear() {

        document
            .querySelectorAll(
                "[data-current-year]"
            )
            .forEach(
                function (element) {

                    element.textContent =
                        new Date()
                            .getFullYear();

                }
            );

    }


    /*
     * =====================================================
     * INITIALISE
     * =====================================================
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


        /*
         * Select the homepage set ONCE.
         *
         * This same selection is used for
         * hero, featured grid, About preview
         * and event preview.
         */

        const featuredPhotos =
            getFeaturedPhotos(
                photos
            );


        /*
         * HERO
         */

        renderHero(
            featuredPhotos[0] ||
            photos[0]
        );


        /*
         * FEATURED GRID
         */

        renderFeatured(
            featuredPhotos
        );


        /*
         * WORK PAGE
         */

        renderGallery(
            photos
        );


        /*
         * ABOUT PREVIEW
         */

        renderAboutPhoto(
            featuredPhotos[1] ||
            featuredPhotos[0] ||
            photos[0]
        );


        /*
         * EVENT PREVIEW
         */

        renderEventImage(
            featuredPhotos[2] ||
            featuredPhotos[0] ||
            photos[0]
        );


        /*
         * FILTERS
         */

        setupFilters(
            photos
        );

    }


    /*
     * =====================================================
     * START
     * =====================================================
     */

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
