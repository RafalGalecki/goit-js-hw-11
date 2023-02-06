'use strict';

import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('.search-form__input');
const searchBtn = document.querySelector('.search-form__btn');
const loadMoreBtn = document.querySelector('.load-more');
const galleryContainer = document.querySelector('.gallery');

let q;
let page = 1;
let per_page = 40;

loadMoreBtn.classList.add('hidden');
let isVisible = false;

// This listener is to get keyWords
// and to run fetching engine by pressing submit button
searchForm.addEventListener('submit', handleSubmit);

// This handler manages main functions for searching photos
function handleSubmit(event) {
  event.preventDefault();
  getKeyWords();
  refreshRendering(); // Remove old gallery on a new search
  fetchPhotos();
}

// This function get keywords from input for search criteria
function getKeyWords() {
  Array.from(searchForm.elements).forEach(el => {
    if (el.name === 'searchQuery') {
      let keyWords = el.value.trim().replaceAll(' ', '+');
      q = keyWords;
    }
  });
}

// -------------------------------------------
// MAIN ASYNC/AWAIT FETCH FUNCTION using AXIOS
// -------------------------------------------
async function fetchPhotos() {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '32900426-a12efdc1668c6b000f20a1416',
        q,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page,
      },
    });

    successAlert(page, response.data.totalHits); // Notiflix alert

    noPhotosMatching(response.data.totalHits); // Notiflix alert

    renderSinglePhotoCard(response.data); // Photo cards rendering

    loadMore(response.data.totalHits); // Button 'Load More'

    allPagesLoaded(response.data.totalHits); // Notiflix alert
  } catch (error) {
    console.error(error);
  }
}

// This function makes the 'Load More' button visible
// listening to user's click
// to fetch and render more photos of the same search criteria
function loadMore(totalHits) {
  let totalPages = totalHits / per_page;

  if (totalPages > page || page === totalPages) {
    page += 1;

    isVisible = true;
    loadMoreBtn.classList.remove('hidden');
    // The listener for 'Load More" option
    loadMoreBtn.addEventListener('click', fetchPhotos);
  }
  if (page > totalPages) {
    isVisible = false;
    loadMoreBtn.classList.add('hidden');
  }
}

// Smooth scrolling
// This function works for 'Load More' photos rendered
function smoothScrolling() {
  if (isVisible) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

//render photo card for each photo fetched
// and start simpleLightbox gallery
function renderSinglePhotoCard(data) {
  data.hits.forEach(el => {
    const photoCardDiv = document.createElement('div');
    photoCardDiv.classList.add('photo-card');
    photoCardDiv.classList.add('gallery__item');
    galleryContainer.appendChild(photoCardDiv);

    const photoLarge = document.createElement('a');
    photoLarge.setAttribute('href', el.largeImageURL);
    photoLarge.classList.add('gallery__link');
    photoCardDiv.appendChild(photoLarge);

    const photoImg = document.createElement('img');
    photoImg.setAttribute('src', el.webformatURL);
    photoImg.setAttribute('alt', el.tags);
    photoImg.setAttribute('loading', 'lazy');
    photoImg.classList.add('gallery__image');
    photoLarge.appendChild(photoImg);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');
    photoCardDiv.appendChild(infoDiv);

    renderInfos(el, infoDiv);
    smoothScrolling();
  });
  const gallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}

//render photo label
//- some informations of each photo beneath of it
function renderInfos(data, element) {
  let infoData = {
    Likes: data.likes,
    Views: data.views,
    Comments: data.comments,
    Downloads: data.downloads,
  };
  const keys = Object.keys(infoData);

  for (const info of keys) {
    const infoParagraph = document.createElement('p');
    infoParagraph.classList.add('info-item');
    element.appendChild(infoParagraph);

    const infoLabel = document.createElement('b');
    infoLabel.textContent = `${info}`;
    infoParagraph.appendChild(infoLabel);

    const infoValue = document.createElement('span');
    infoValue.textContent = infoData[info].toLocaleString('pl-PL');
    infoParagraph.appendChild(infoValue);
  }
}

// Refresh rendered photos and reset page value to 1
// by removing html gallery child elements created
function refreshRendering() {
  const elementToRemove = document.querySelectorAll('.gallery__item');
  if (elementToRemove.length > 0) {
    for (let i = 0; i < elementToRemove.length; i++) {
      elementToRemove[i].remove();
    }
    page = 1;
  }
}

// !!! 3 alert notifications using Notiflix:

// This info-alert appears on the first submit of new keyWords only
function successAlert(page, totalHits) {
  if (page === 1 && totalHits > 0) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images`, {
      timeout: 3000,
    });
  }
}

// This info-alert appears when there is no matching photos
function noPhotosMatching(matching) {
  if (matching === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      {
        timeout: 3000,
      }
    );
  }
}

// This info-alert appears on the last page of totalHits
// and hide the loadMore button
function allPagesLoaded(totalHits) {
  let totalPages = totalHits / per_page;

  if (page > totalPages && totalPages !== 0) {
    loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results.",
      {
        timeout: 3000,
      }
    );
  }
}
