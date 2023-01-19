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

// data.config.params.
let myParams = {
  key: '32900426-a12efdc1668c6b000f20a1416',
  q,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  page,
  per_page,
};

let whichTurn = 1;

let webformatURL;
let largeImageURL;
let tags;
let likes;
let views;
let comments;
let downloads;
let totalHits;

//const lightbox1 = $('.lighbox-1 a').simpleLightbox();

// data.hits.webformatURL;
// data.hits.largeImageURL;
// data.hits.tags;
// data.hits.likes;
// data.hits.views;
// data.hits.comments;
// data.hits.downloads;
// data.totalHits;

searchForm.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  getKeyWords();
  refreshRendering();
  fetchPhotos();
}

function getKeyWords() {
  Array.from(searchForm.elements).forEach(el => {
    if (el.name === 'searchQuery') {
      let keyWords = el.value.trim().replaceAll(' ', '+');
      myParams.q = keyWords;
      console.log('q is', q);
      console.log('Czy jest q w obiekcie:', myParams);
    }
  });
}
// pierwsza działająca funkcja z axios
async function fetchPhotos() {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: myParams,
    });

    noPhotosMatching(response.data.totalHits);
    renderSinglePhotoCard(response.data);

    console.log(response.data.totalHits);
  } catch (error) {
    console.error(error);
  }
}
function noPhotosMatching(matching) {
  if (matching === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}
//druga funkcja fetch axios
// const fetchPhotos = async () => {
//   const response = await axios.get('https://pixabay.com/api/', {
//     params: myParams,
//   });
//   const data = await response.json();
//   return data;
// };

//first render single photo card function
function renderSinglePhotoCard(data) {
    
  //refreshRendering();

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
  });
  const gallery = new SimpleLightbox('.gallery a', {
    captionDelay: 2500,
  });
}

// second rendering function
function createSimpleGalleryItems(data) {
  const items = data.hits
    .map(
      image =>
        `<a class="gallery__item" href="${image.largeImageURL}"><img class="gallery__image" src="${image.webformatURL}" alt="${image.tags}"/></a>`
    )
    .join('');
  galleryContainer.insertAdjacentHTML('beforeend', items);
}

// refreshing rendered photos
// This function remove gallery items
function refreshRendering() {
  elementToRemove = document.querySelectorAll('.gallery__item');

  if (elementToRemove.length > 1) {
    for (let i = 0; i < elementToRemove.length; i++) {
      elementToRemove[i].remove();
    }
  }
}
