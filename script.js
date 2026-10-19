"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const announcement = document.querySelector(".announcement");
    const announcementClose = document.querySelector(".announcement-close");
    if (announcement && announcementClose) {
        announcementClose.addEventListener("click", function () {
            announcement.remove();
        });
    }

    // Shared favourites and shopping bag for the home and collections pages.
    const shopPanel = document.getElementById("shopPanel");
    const shopPanelItems = document.getElementById("shopPanelItems");
    const shopPanelNote = document.getElementById("shopPanelNote");
    const shopStatus = document.getElementById("shopStatus");

    if (shopPanel && shopPanelItems) {
        const favouritesKey = "nostra-favourites-v1";
        const cartKey = "nostra-cart-v1";

        function readShopList(key) {
            try {
                const saved = JSON.parse(window.localStorage.getItem(key) || "[]");
                return Array.isArray(saved) ? saved : [];
            } catch (error) {
                return [];
            }
        }

        let favouriteItems = readShopList(favouritesKey).filter(function (item) {
            return item && typeof item.id === "string";
        });
        let cartItems = readShopList(cartKey).filter(function (item) {
            return item && typeof item.id === "string" && Number(item.quantity) > 0;
        });
        let panelType = "favourites";
        let lastPanelTrigger = null;

        function saveShopLists() {
            try {
                window.localStorage.setItem(favouritesKey, JSON.stringify(favouriteItems));
                window.localStorage.setItem(cartKey, JSON.stringify(cartItems));
            } catch (error) {
                // The controls continue to work for this page if browser storage is unavailable.
            }
        }

        function formatPrice(amount) {
            return "₹" + Number(amount || 0).toLocaleString("en-IN");
        }

        function getCardDetails(card) {
            const title = card.querySelector("h3");
            const priceText = card.querySelector(".product-info strong, .collection-product-info strong");
            const image = card.querySelector("img");
            const name = title ? title.textContent.trim() : "NOSTRA style";
            const price = priceText ? Number(priceText.textContent.replace(/[^0-9]/g, "")) : 0;
            const id = card.dataset.shopId || name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            card.dataset.shopId = id;
            return {
                id: id,
                name: name,
                price: price,
                image: image ? image.getAttribute("src") : "",
                alt: image ? image.alt : name
            };
        }

        function makeProductButton(className, label, markup) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = className;
            button.setAttribute("aria-label", label);
            button.innerHTML = markup;
            return button;
        }

        const favouriteMarkup = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>';
        const bagMarkup = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg><span>Add to bag</span>';
        const shopCards = Array.from(document.querySelectorAll("#productGrid [data-product], .product-grid:not(#productGrid) .product-card"));

        function isFavourite(id) {
            return favouriteItems.some(function (item) { return item.id === id; });
        }

        function updateProductButtons() {
            shopCards.forEach(function (card) {
                const details = getCardDetails(card);
                const button = card.querySelector(".product-favourite");
                if (!button) return;
                const saved = isFavourite(details.id);
                button.classList.toggle("is-saved", saved);
                button.setAttribute("aria-pressed", String(saved));
                button.setAttribute("aria-label", saved ? "Remove " + details.name + " from favourites" : "Add " + details.name + " to favourites");
            });
        }

        function updateHeaderCounts() {
            const favouriteCount = favouriteItems.length;
            const cartCount = cartItems.reduce(function (total, item) { return total + Number(item.quantity || 0); }, 0);
            document.querySelectorAll('[data-count="favourites"]').forEach(function (badge) {
                badge.textContent = favouriteCount > 99 ? "99+" : String(favouriteCount);
            });
            document.querySelectorAll('[data-count="cart"]').forEach(function (badge) {
                badge.textContent = cartCount > 99 ? "99+" : String(cartCount);
            });
            document.querySelectorAll('[data-panel-trigger="favourites"]').forEach(function (button) {
                button.setAttribute("aria-label", "View favourites, " + favouriteCount + (favouriteCount === 1 ? " item" : " items"));
            });
            document.querySelectorAll('[data-panel-trigger="cart"]').forEach(function (button) {
                button.setAttribute("aria-label", "View shopping bag, " + cartCount + (cartCount === 1 ? " item" : " items"));
            });
        }

        function createPanelEmpty(message) {
            const empty = document.createElement("p");
            empty.className = "shop-panel-empty";
            empty.textContent = message;
            const link = document.createElement("a");
            link.href = "collections.html";
            link.textContent = "Explore the collection ↗";
            empty.appendChild(link);
            return empty;
        }

        function createPanelRow(item, type) {
            const row = document.createElement("div");
            row.className = "shop-panel-item";
            const image = document.createElement("img");
            image.src = item.image || "images/products/white-tee.jpg";
            image.alt = item.alt || item.name;
            image.loading = "lazy";
            const copy = document.createElement("div");
            copy.className = "shop-panel-item-copy";
            const name = document.createElement("strong");
            name.textContent = item.name;
            const price = document.createElement("span");
            price.textContent = formatPrice(item.price) + (type === "cart" ? " each" : "");
            copy.append(name, price);
            row.append(image, copy);

            if (type === "cart") {
                const controls = document.createElement("div");
                controls.className = "shop-quantity-controls";
                const decrease = document.createElement("button");
                decrease.type = "button";
                decrease.className = "shop-quantity-button";
                decrease.dataset.shopAction = "decrease";
                decrease.dataset.shopId = item.id;
                decrease.setAttribute("aria-label", "Remove one " + item.name + " from bag");
                decrease.textContent = "−";
                const quantity = document.createElement("span");
                quantity.textContent = String(item.quantity);
                const increase = document.createElement("button");
                increase.type = "button";
                increase.className = "shop-quantity-button";
                increase.dataset.shopAction = "increase";
                increase.dataset.shopId = item.id;
                increase.setAttribute("aria-label", "Add one " + item.name + " to bag");
                increase.textContent = "+";
                controls.append(decrease, quantity, increase);
                row.appendChild(controls);
            } else {
                const remove = document.createElement("button");
                remove.type = "button";
                remove.className = "shop-panel-remove";
                remove.dataset.shopAction = "remove-favourite";
                remove.dataset.shopId = item.id;
                remove.setAttribute("aria-label", "Remove " + item.name + " from favourites");
                remove.textContent = "×";
                row.appendChild(remove);
            }
            return row;
        }

        function renderShopPanel() {
            const showingCart = panelType === "cart";
            const title = document.getElementById("shopPanelTitle");
            const eyebrow = document.getElementById("shopPanelEyebrow");
            if (title) title.textContent = showingCart ? "Your shopping bag" : "Your favourites";
            if (eyebrow) eyebrow.textContent = showingCart ? "READY WHEN YOU ARE" : "YOUR SAVED STYLES";
            shopPanelItems.textContent = "";
            const items = showingCart ? cartItems : favouriteItems;
            if (items.length === 0) {
                shopPanelItems.appendChild(createPanelEmpty(showingCart ? "Your shopping bag is empty." : "You haven't saved any styles yet."));
            } else {
                items.forEach(function (item) { shopPanelItems.appendChild(createPanelRow(item, panelType)); });
            }
            if (shopPanelNote) {
                if (showingCart) {
                    const quantity = cartItems.reduce(function (total, item) { return total + Number(item.quantity || 0); }, 0);
                    const subtotal = cartItems.reduce(function (total, item) {
                        return total + Number(item.price || 0) * Number(item.quantity || 0);
                    }, 0);
                    shopPanelNote.textContent =
                        quantity + (quantity === 1 ? " item" : " items") +
                        " · Subtotal " + formatPrice(subtotal) +
                        " · Saved in this browser.";
                } else {
                    shopPanelNote.textContent = "Your favourite styles are saved in this browser.";
                }
            }
        }

        function closeShopPanel(restoreFocus) {
            if (shopPanel.hidden) return;
            shopPanel.hidden = true;
            document.querySelectorAll("[data-panel-trigger]").forEach(function (button) {
                button.setAttribute("aria-expanded", "false");
            });
            if (restoreFocus && lastPanelTrigger) lastPanelTrigger.focus();
        }

        document.querySelectorAll("[data-panel-trigger]").forEach(function (button) {
            button.addEventListener("click", function () {
                const requestedType = button.dataset.panelTrigger;
                if (!shopPanel.hidden && panelType === requestedType) {
                    closeShopPanel(false);
                    return;
                }
                panelType = requestedType;
                lastPanelTrigger = button;
                renderShopPanel();
                shopPanel.hidden = false;
                document.querySelectorAll("[data-panel-trigger]").forEach(function (trigger) {
                    trigger.setAttribute("aria-expanded", String(trigger === button));
                });
            });
        });

        const panelClose = shopPanel.querySelector(".shop-panel-close");
        if (panelClose) panelClose.addEventListener("click", function () { closeShopPanel(true); });

        shopPanel.addEventListener("click", function (event) {
            const actionButton = event.target.closest("[data-shop-action]");
            if (!actionButton) return;
            const id = actionButton.dataset.shopId;
            const action = actionButton.dataset.shopAction;
            if (action === "remove-favourite") {
                favouriteItems = favouriteItems.filter(function (item) { return item.id !== id; });
            } else {
                const item = cartItems.find(function (entry) { return entry.id === id; });
                if (item && action === "increase") item.quantity = Math.min(99, Number(item.quantity) + 1);
                if (item && action === "decrease") {
                    item.quantity = Number(item.quantity) - 1;
                    if (item.quantity <= 0) cartItems = cartItems.filter(function (entry) { return entry.id !== id; });
                }
            }
            saveShopLists();
            updateHeaderCounts();
            updateProductButtons();
            renderShopPanel();
        });

        shopPanel.addEventListener("click", function (event) {
            if (event.target.closest(".shop-panel-empty a")) closeShopPanel(false);
        });

        document.addEventListener("click", function (event) {
            const trigger = event.target.closest("[data-panel-trigger]");
            if (!shopPanel.hidden && !shopPanel.contains(event.target) && !trigger) closeShopPanel(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeShopPanel(true);
        });

        window.addEventListener("storage", function (event) {
            if (event.key === favouritesKey || event.key === cartKey) {
                favouriteItems = readShopList(favouritesKey).filter(function (item) { return item && typeof item.id === "string"; });
                cartItems = readShopList(cartKey).filter(function (item) {
                    return item && typeof item.id === "string" && Number(item.quantity) > 0;
                });
                updateHeaderCounts();
                updateProductButtons();
                if (!shopPanel.hidden) renderShopPanel();
            }
        });

        shopCards.forEach(function (card) {
            const details = getCardDetails(card);
            const imageArea = card.querySelector(".collection-product-image");
            const favouriteButton = makeProductButton("product-favourite", "Add " + details.name + " to favourites", favouriteMarkup);
            if (imageArea) imageArea.appendChild(favouriteButton);
            else card.insertBefore(favouriteButton, card.firstChild);

            const addButton = makeProductButton("product-add-button", "Add " + details.name + " to shopping bag", bagMarkup);
            const info = card.querySelector(".collection-product-info, .product-info");
            if (info) info.appendChild(addButton);

            favouriteButton.addEventListener("click", function () {
                const existingIndex = favouriteItems.findIndex(function (item) { return item.id === details.id; });
                if (existingIndex >= 0) {
                    favouriteItems.splice(existingIndex, 1);
                    if (shopStatus) shopStatus.textContent = details.name + " removed from favourites.";
                } else {
                    favouriteItems.push(details);
                    if (shopStatus) shopStatus.textContent = details.name + " added to favourites.";
                }
                saveShopLists();
                updateHeaderCounts();
                updateProductButtons();
                if (!shopPanel.hidden) renderShopPanel();
            });

            addButton.addEventListener("click", function () {
                const existing = cartItems.find(function (item) { return item.id === details.id; });
                if (existing) existing.quantity = Math.min(99, Number(existing.quantity) + 1);
                else cartItems.push(Object.assign({ quantity: 1 }, details));
                if (shopStatus) shopStatus.textContent = details.name + " added to your shopping bag.";
                saveShopLists();
                updateHeaderCounts();
                if (!shopPanel.hidden && panelType === "cart") renderShopPanel();
            });
        });

        updateHeaderCounts();
        updateProductButtons();
    }
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        function closeMenu() {
            navLinks.classList.remove("show");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
            menuToggle.textContent = "☰";
        }

        menuToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("show");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
            menuToggle.textContent = isOpen ? "×" : "☰";
        });

        navLinks.addEventListener("click", function (event) {
            if (event.target.closest("a")) closeMenu();
        });

        document.addEventListener("click", function (event) {
            if (navLinks.classList.contains("show") &&
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeMenu();
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 900) closeMenu();
        });
    }

    const heroImage = document.getElementById("heroSlideImage");
    const heroTitle = document.getElementById("heroTitle");
    const heroSubtitle = document.getElementById("heroSubtitle");
    const heroSlider = document.querySelector(".hero-slider");
    if (heroImage && heroTitle && heroSubtitle && heroSlider) {
        const slides = [
            {
                label: "EVERYDAY / MADE FOR YOU",
                title: "Wear the everyday.",
                subtitle: "Thoughtful essentials. Made to feel like you.",
                image: "images/hero slider/hero section image 1.jpg",
                alt: "Man in a relaxed neutral outfit outdoors among green trees",
                objectPosition: "50% 38%",
                mobileObjectPosition: "50% 50%"
            },
            {
                label: "YOUR STYLE, YOUR RULES",
                title: "Make room for your own rules.",
                subtitle: "Confident pieces for your own point of view.",
                image: "images/hero slider/hero section image 2.jpg",
                alt: "Fashion portrait in a black leather look with bold jewellery",
                objectPosition: "50% 38%",
                mobileObjectPosition: "50% 50%"
            },
            {
                label: "FRESH FINDS / EASY SUMMER",
                title: "Light layers. Long days.",
                subtitle: "Fresh favourites for the days ahead.",
                image: "images/hero slider/hero section image 3.jpg",
                alt: "Model in a light outfit framed by a soft green doorway",
                objectPosition: "50% 38%",
                mobileObjectPosition: "50% 50%"
            }
        ];
        const previousSlide = document.getElementById("previousSlide");
        const nextSlide = document.getElementById("nextSlide");
        const slidePosition = document.getElementById("heroSlidePosition");
        const slideLabel = document.getElementById("heroSlideLabel");
        const slideDots = Array.from(heroSlider.querySelectorAll("[data-slide-to]"));
        const heroContent = heroSlider.querySelector(".hero-slide-content");
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let currentSlide = 0;
        let transitionTimer = null;
        let autoplayTimer = null;

        slides.slice(1).forEach(function (slide) {
            const image = new Image();
            image.src = slide.image;
        });
        function showSlide(index) {
            currentSlide = (index + slides.length) % slides.length;
            const slide = slides[currentSlide];
            window.clearTimeout(transitionTimer);
            heroImage.classList.add("is-changing");
            if (heroContent) heroContent.classList.add("is-changing");
            transitionTimer = window.setTimeout(function () {
                heroTitle.textContent = slide.title;
                heroSubtitle.textContent = slide.subtitle;
                heroImage.src = slide.image;
                heroImage.alt = slide.alt;
                heroImage.style.setProperty("--hero-object-position", slide.objectPosition);
                heroImage.style.setProperty("--hero-object-position-mobile", slide.mobileObjectPosition);
                if (slideLabel) slideLabel.textContent = slide.label;
                if (slidePosition) {
                    slidePosition.textContent = String(currentSlide + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
                }
                slideDots.forEach(function (dot, dotIndex) {
                    const active = dotIndex === currentSlide;
                    dot.classList.toggle("is-active", active);
                    if (active) dot.setAttribute("aria-current", "true");
                    else dot.removeAttribute("aria-current");
                });
                window.requestAnimationFrame(function () {
                    heroImage.classList.remove("is-changing");
                    if (heroContent) heroContent.classList.remove("is-changing");
                });
            }, 180);
        }

        function stopAutoplay() {
            window.clearTimeout(autoplayTimer);
            autoplayTimer = null;
        }

        function scheduleAutoplay() {
            stopAutoplay();
            if (prefersReducedMotion || document.hidden || heroSlider.contains(document.activeElement)) {
                return;
            }

            autoplayTimer = window.setTimeout(function () {
                showSlide(currentSlide + 1);
                scheduleAutoplay();
            }, 6000);
        }

        if (previousSlide) {
            previousSlide.addEventListener("click", function () {
                showSlide(currentSlide - 1);
                scheduleAutoplay();
            });
        }
        if (nextSlide) {
            nextSlide.addEventListener("click", function () {
                showSlide(currentSlide + 1);
                scheduleAutoplay();
            });
        }
        slideDots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.dataset.slideTo));
                scheduleAutoplay();
            });
        });

        heroSlider.addEventListener("focusin", stopAutoplay);
        heroSlider.addEventListener("focusout", function (event) {
            if (!heroSlider.contains(event.relatedTarget)) scheduleAutoplay();
        });
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) stopAutoplay();
            else scheduleAutoplay();
        });

        scheduleAutoplay();
    }

    const productGrid = document.getElementById("productGrid");
    if (productGrid) {
        const products = Array.from(productGrid.querySelectorAll("[data-product]"));
        const searchInput = document.getElementById("productSearch");
        const sortSelect = document.getElementById("productSort");
        const categories = Array.from(document.querySelectorAll("[data-category-filter]"));
        const results = document.getElementById("productResults");
        const activeFilters = document.getElementById("activeFilters");
        const clearButton = document.getElementById("clearFilters");
        const emptyState = document.getElementById("emptyState");
        const emptyClear = document.getElementById("emptyClear");

        const pageFilters = new URLSearchParams(window.location.search);
        if (searchInput) {
            const incomingSearch = pageFilters.get("search") || pageFilters.get("q");
            if (incomingSearch) searchInput.value = incomingSearch;
        }
        categories.forEach(function (input) {
            const requestedValues = (pageFilters.get(input.dataset.filterGroup || "") || "")
                .split(",")
                .map(function (value) { return value.trim().toLocaleLowerCase(); })
                .filter(Boolean);
            input.checked = requestedValues.includes(input.value.toLocaleLowerCase());
        });

        function getProductValues(product, group) {
            return (product.dataset[group] || "").toLocaleLowerCase().split(/\s+/).filter(Boolean);
        }

        function updateProducts() {
            const query = searchInput ? searchInput.value.trim().toLocaleLowerCase() : "";
            const searchTerms = query.split(/\s+/).filter(Boolean);
            const selected = {};

            categories.filter(function (input) { return input.checked; }).forEach(function (input) {
                const group = input.dataset.filterGroup || "category";
                if (!selected[group]) selected[group] = [];
                selected[group].push(input.value.toLocaleLowerCase());
            });

            let visibleCount = 0;
            products.forEach(function (product) {
                // Selected options in one group are alternatives; different groups narrow results together.
                const filtersMatch = Object.keys(selected).every(function (group) {
                    const productValues = getProductValues(product, group);
                    return selected[group].some(function (value) {
                        return productValues.includes(value);
                    });
                });

                const searchableProduct = product.cloneNode(true);
                searchableProduct.querySelectorAll(".product-add-button, .product-favourite").forEach(function (control) { control.remove(); });
                const searchableText = [
                    searchableProduct.textContent,
                    product.dataset.category,
                    product.dataset.occasion,
                    product.dataset.color,
                    product.dataset.arrival
                ].join(" ").toLocaleLowerCase();
                const searchMatches = searchTerms.every(function (term) {
                    return searchableText.includes(term);
                });
                const visible = filtersMatch && searchMatches;

                product.hidden = !visible;
                if (visible) visibleCount += 1;
            });

            if (results) {
                results.textContent = visibleCount + (visibleCount === 1 ? " product" : " products");
            }

            if (activeFilters) {
                activeFilters.textContent = "";

                categories.filter(function (input) { return input.checked; }).forEach(function (input) {
                    const label = input.closest("label");
                    const filterName = label ? label.textContent.trim().replace(/\s+/g, " ") : input.value;
                    const item = document.createElement("li");
                    const chip = document.createElement("button");
                    chip.type = "button";
                    chip.className = "filter-chip";
                    chip.textContent = filterName + " ×";
                    chip.setAttribute("aria-label", "Remove filter: " + filterName);
                    chip.addEventListener("click", function () {
                        input.checked = false;
                        updateProducts();
                        input.focus();
                    });
                    item.appendChild(chip);
                    activeFilters.appendChild(item);
                });

                if (searchInput && query) {
                    const item = document.createElement("li");
                    const chip = document.createElement("button");
                    const searchTerm = searchInput.value.trim();
                    chip.type = "button";
                    chip.className = "filter-chip";
                    chip.textContent = "Search: “" + searchTerm + "” ×";
                    chip.setAttribute("aria-label", "Clear search for " + searchTerm);
                    chip.addEventListener("click", function () {
                        searchInput.value = "";
                        updateProducts();
                        searchInput.focus();
                    });
                    item.appendChild(chip);
                    activeFilters.appendChild(item);
                }

                activeFilters.hidden = activeFilters.childElementCount === 0;
            }

            const sortMode = sortSelect ? sortSelect.value : "featured";
            const sortedProducts = products.slice();
            if (sortMode === "price-low") {
                sortedProducts.sort(function (a, b) {
                    return Number(a.dataset.price) - Number(b.dataset.price);
                });
            } else if (sortMode === "price-high") {
                sortedProducts.sort(function (a, b) {
                    return Number(b.dataset.price) - Number(a.dataset.price);
                });
            } else if (sortMode === "name") {
                sortedProducts.sort(function (a, b) {
                    const nameA = a.querySelector("h3").textContent.trim();
                    const nameB = b.querySelector("h3").textContent.trim();
                    return nameA.localeCompare(nameB);
                });
            }

            sortedProducts.forEach(function (product) { productGrid.appendChild(product); });
            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
                productGrid.appendChild(emptyState);
            }
        }

        categories.forEach(function (input) { input.addEventListener("change", updateProducts); });
        if (searchInput) searchInput.addEventListener("input", updateProducts);
        if (sortSelect) sortSelect.addEventListener("change", updateProducts);

        function clearFilters() {
            categories.forEach(function (input) { input.checked = false; });
            if (searchInput) searchInput.value = "";
            if (sortSelect) sortSelect.value = "featured";
            updateProducts();
        }

        if (clearButton) clearButton.addEventListener("click", clearFilters);
        if (emptyClear) emptyClear.addEventListener("click", clearFilters);
        updateProducts();
    }

    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const emailInput = document.getElementById("newsletterEmail");
            const message = document.getElementById("newsletterMessage");
            if (!emailInput || !message || !emailInput.checkValidity()) {
                if (emailInput) emailInput.reportValidity();
                return;
            }
            message.textContent = "Thanks for joining us! This demo form does not save email addresses.";
            newsletterForm.reset();
        });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        const nameInput = document.getElementById("contactName");
        const emailInput = document.getElementById("contactEmail");
        const messageInput = document.getElementById("contactMessage");
        const success = document.getElementById("contactSuccess");

        function setError(input, errorId, message) {
            const output = document.getElementById(errorId);
            const invalid = Boolean(message);
            if (output) output.textContent = message;
            if (input) {
                input.classList.toggle("invalid", invalid);
                input.setAttribute("aria-invalid", String(invalid));
            }
            return invalid;
        }

        if (nameInput) {
            nameInput.addEventListener("input", function () {
                if (nameInput.value.trim().length >= 2) {
                    setError(nameInput, "nameError", "");
                    if (success) success.textContent = "";
                }
            });
        }

        if (emailInput) {
            emailInput.addEventListener("input", function () {
                if (emailInput.value.trim() && emailInput.validity.valid) {
                    setError(emailInput, "emailError", "");
                    if (success) success.textContent = "";
                }
            });
        }

        if (messageInput) {
            messageInput.addEventListener("input", function () {
                if (messageInput.value.trim().length >= 10) {
                    setError(messageInput, "messageError", "");
                    if (success) success.textContent = "";
                }
            });
        }

        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (success) success.textContent = "";

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const message = messageInput ? messageInput.value.trim() : "";
            const badName = setError(nameInput, "nameError",
                name.length >= 2 ? "" : "Please enter your name (at least 2 characters).");
            let emailError = "";
            if (!email) emailError = "Please enter your email address.";
            else if (emailInput && !emailInput.validity.valid) emailError = "Please enter a valid email address.";
            const badEmail = setError(emailInput, "emailError", emailError);
            const badMessage = setError(messageInput, "messageError",
                message.length >= 10 ? "" : "Please enter at least 10 characters.");

            if (badName || badEmail || badMessage) {
                if (success) {
                    success.textContent = "Please correct the highlighted fields and try again.";
                    success.style.color = "#b84646";
                }
                const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            if (success) {
                success.textContent = "Thanks, " + name + "! Your demo form has been submitted successfully.";
                success.style.color = "#526c26";
            }
            contactForm.reset();
            [nameInput, emailInput, messageInput].forEach(function (input) {
                if (input) {
                    input.classList.remove("invalid");
                    input.setAttribute("aria-invalid", "false");
                }
            });
            ["nameError", "emailError", "messageError"].forEach(function (id) {
                const output = document.getElementById(id);
                if (output) output.textContent = "";
            });
        });
    }
});






