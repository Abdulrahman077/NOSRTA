# NOSRTA
NOSTRA is a responsive e-commerce website featuring product collections, search and filtering, and a contact page, built using HTML, CSS, and JavaScript.

A responsive storefront built with plain HTML, CSS, and JavaScript for a front-end web development assignment. It uses local product and brand images and needs no build tools or packages.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Home page with a split editorial carousel, signature style edit, brand strip, product highlights, offer, and newsletter form |
| `collections.html` | 12-product catalogue across clothing, footwear, and accessories, with search, filters, sorting, and empty state |
| `contact.html` | Contact page with client-side form validation |
| `style.css` | Shared design, home page styling, navigation, and responsive layout |
| `collections.css` | Collection page layout and filter/product styling |
| `contact.css` | Contact page layout and form styling |
| `script.js` | Mobile navigation, automatic home carousel, browser-local bag/favourites, collection search/filter/sort, and demo form behavior |
| `images/` | Product photography, hero images, and brand marks |

## Run locally

Keep the `images` folder beside the HTML, CSS, and JavaScript files. Open `index.html` in a browser (or use VS Code Live Server), then use the navigation to visit Collections and Contact Us.

## Home carousel and shopping shortcuts

The split home hero advances between three local image slides, with previous/next buttons, slide dots, and a play/pause control. It pauses while hovered or focused and respects reduced-motion settings. Product cards on Home and Collections can be added to the shopping bag or favourites; these demo lists stay in the browser and do not process orders.

## Collections behavior

Search checks product names and details such as category, occasion, colour, and arrival type. Each search word must match. If multiple options are selected within one filter group, a product can match any of them; selections from different groups narrow the results together. Selected filters and the search term appear as removable chips. Sorting supports featured order, price, and name. Home style-edit cards can open the catalogue with a matching category or occasion preselected. “Clear all” resets search, filters, and sorting.

## Demo forms

The contact and newsletter forms run in the browser only. They validate input and show confirmation messages, but do not send or save information.

## Presentation checklist

- View all three pages at desktop, tablet, and phone widths.
- On Collections, combine filters, search by product or colour, change sorting, and check the no-results and reset states.
- On Contact Us, try empty and valid submissions and confirm the inline feedback.
- Check that the mobile menu opens and closes with its button, Escape, and an outside click.
