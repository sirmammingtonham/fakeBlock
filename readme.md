# fakeBlock
## The Misinformation Blocking Browser Extension

RPI Software Design & Documentation S21

fakeBlock is a cross-platform browser extension that functions like an ad-block, but for fake news. 

We use a neural network trained on 1.8M news articles to detect whether or not a paragraph contains misinformation, then hide the offending paragraph.
You can click on a button to reveal the blocked information and open a results page with data about why our model blocked it, such as probability scores and category tags.

## Installing fakeBlock
Chrome webstore and Firefox addon store release soon! Waiting on review.
For now, build from source and install with the methods below.

## Building fakeBlock from source

Run the following commands:
 1. `npm install .`
 2. `npm run build`

There should be a new folder `dist/`. 

This is the unpacked extension that can be loaded into your browser. 

## Installing fakeBlock from `dist/`
To install on chrome:
 1. Visit `chrome://extensions` (via omnibox or menu -> Tools -> Extensions).
 2. Enable Developer mode by ticking the checkbox in the upper-right corner.
 3. Click on the "Load unpacked extension..." button.
 4. Select the `dist/` folder.

To install on firefox:
 1. Open the `about:debugging` page
 2. Click "This Firefox" (in newer versions of Firefox)
 3. Click "Load Temporary Add-on"
 4. Select `dist/manifest.json`

## Running unit tests

Run `npm run test` to lint the codebase and run our jest testing suite.


Initial files based off [browser-extension-template](https://github.com/fregante/browser-extension-template)
